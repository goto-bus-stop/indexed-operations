import { orient2d } from 'robust-predicates'

export type BBox = [minX: number, minY: number, maxX: number, maxY: number]
export type Point = [lng: number, lat: number]
export type Ring = Point[]
export type Polygon = Ring[]
export type MultiPolygon = Polygon[]

type RingBBoxIndex = ReturnType<typeof createRingBBoxIndex>
type RingNaturalIndex = ReturnType<typeof createRingNaturalIndex>
type RingIndex = RingBBoxIndex | RingNaturalIndex
type PolygonIndex = ReturnType<typeof createPolygonIndex>
type MultiPolygonIndex = ReturnType<typeof createMultiPolygonIndex>

// bbox indices
const kMinX = 0
const kMinY = 1
const kMaxX = 2
const kMaxY = 3

/** The amount of bboxes in the lower index level that each bbox covers in a natural index tree. */
const kIndexSpread = 16

function assertPolygon (rings: Ring[]): asserts rings is [exterior: Ring, ...holes: Ring[]] {
  if (rings.length === 0) {
    throw new TypeError('indexed-operations: polygon must have at an exterior ring')
  }
}

function assertMultiPolygon (polygons: Polygon[]): asserts polygons is [exterior: Ring, ...holes: Ring[]][] {
  for (let i = 0; i < polygons.length; i += 1) {
    assertPolygon(polygons[i]!)
  }
}

/** Create index structures for a ring. Normally you would use `createPolygonIndex`. */
export function createRingIndex (ring: Ring): RingIndex {
  if (ring.length < kIndexSpread * 2) {
    return createRingBBoxIndex(ring)
  }

  return createRingNaturalIndex(ring)
}

/** Create index structures for a Polygon. */
export function createPolygonIndex (polygon: Polygon) {
  assertPolygon(polygon)

  const [exterior, ...interior] = polygon
  const exteriorIndex = createRingIndex(exterior)
  const interiorIndices: RingIndex[] = []
  for (let i = 0; i < interior.length; i += 1) {
    interiorIndices.push(createRingIndex(interior[i]!))
  }

  // TODO: flatbush index if interiorIndices >= 64

  return { exteriorIndex, interiorIndices }
}

/** Create index structures for a MultiPolygon. */
export function createMultiPolygonIndex (multiPolygon: MultiPolygon) {
  assertMultiPolygon(multiPolygon)

  // TODO: flatbush index if length >= 64

  return multiPolygon.map(createPolygonIndex)
}

/** Return the bounding box for a ring. */
function createRingBBoxIndex (ring: Ring) {
  const bbox = toBBox(ring[0]!)
  for (let i = 1; i < ring.length; i += 1) {
    expandBBoxPoint(bbox, ring[i]!)
  }

  return { ring, bbox }
}

/**
 * Create a tg-style "natural" index for a ring.
 *
 * This index can be built efficiently in a single pass, and works quite well because consecutive
 * segments in a ring are also spatially close to each other. Segments are grouped in batches of
 * `kIndexSpread` and the groups are recursively grouped in batches of `kIndexSpread`, building a
 * tree of bounding boxes.
 *
 * This tree is represented as a `Float64Array` for each level.
 */
function createRingNaturalIndex (ring: Ring) {
  const levels = allocateNaturalIndex(ring.length - 1)
  const bbox = fillNaturalLeafIndex(ring, levels.at(-1)!)
  fillNaturalParentIndexes(levels)
  return { ring, bbox, levels }

  /** Given a number of line segments, allocates an array to store bbox indices for all the segments. */
  function allocateNaturalIndex (numSegments: number) {
    const keysPerLevel: { from: number, to: number }[] = []
    const numLevels = calculateLevels(numSegments)

    let totalKeys = 0
    for (let i = 1; i < numLevels; i += 1) {
      const numKeys = keysAtLevel(numLevels - i, numSegments)
      keysPerLevel.push({ from: totalKeys, to: totalKeys + numKeys })
      totalKeys += numKeys
    }

    const data = new Float64Array(totalKeys * 4)
    const levels = keysPerLevel.map(({ from, to }) => data.subarray(from * 4, to * 4))

    return levels

    function keysAtLevel (level: number, numSegments: number) {
      return Math.ceil(numSegments / (kIndexSpread ** level))
    }

    function calculateLevels (numSegments: number) {
      let level = 1
      for (; keysAtLevel(level, numSegments) > 1; level += 1);
      return level
    }
  }

  /** Fill in the leaf natural index array, while computing the bounding box. */
  function fillNaturalLeafIndex (ring: Ring, lowestLevel: Float64Array): BBox {
    // Fill the initial rectangle with the first point.
    const bbox = toBBox(ring[0]!)

    // Current leaf rectangle, holding kIndexSpread points
    const branchBBox = toBBox(ring[0]!)

    // tg has a highly optimised loop with macros and gotos for various cases.
    // I stripped out additional features and only ported the most flexible
    // version of the loop, and hope the JIT can make it fast enough :)

    let j = 0
    let r = 0
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i]!
      expandBBoxPoint(branchBBox, a)
      j += 1
      if (j === kIndexSpread) {
        const b = ring[i + 1] ?? ring[0]!
        expandBBoxPoint(branchBBox, b)
        expandBBox(bbox, branchBBox)
        lowestLevel.set(branchBBox, r * 4)
        branchBBox[kMinX] = b[0]
        branchBBox[kMinY] = b[1]
        branchBBox[kMaxX] = b[0]
        branchBBox[kMaxY] = b[1]
        j = 0
        r += 1
      }
    }

    if (r * 4 !== lowestLevel.length) {
      expandBBox(bbox, branchBBox)
      lowestLevel.set(branchBBox, r * 4)
    }

    return bbox
  }

  function fillNaturalParentIndexes (levels: Float64Array[]) {
    // XXX: not sure if I translated this correctly
    for (let lvl = levels.length - 2; lvl >= 0; lvl -= 1) {
      const level = levels[lvl]!
      const levelBelow = levels[lvl + 1]!
      for (let i = 0; i < level.length / 4; i += 1) {
        // i = the index of the bbox in the current level;
        // s = the index of the first bbox in the level below;
        const s = i * kIndexSpread
        // e = the index of the last bbox in the level below.
        const e = Math.min(levelBelow.length / 4, s + kIndexSpread)
        // Could write this all out by hand as four big `Math.min`/`Math.max` calls,
        // with 16 arguments, but probably not worth it.
        level[i * 4 + kMinX] = levelBelow[s * 4 + kMinX]!
        level[i * 4 + kMinY] = levelBelow[s * 4 + kMinY]!
        level[i * 4 + kMaxX] = levelBelow[s * 4 + kMaxX]!
        level[i * 4 + kMaxY] = levelBelow[s * 4 + kMaxY]!
        for (let j = s + 1; j < e; j += 1) {
          level[i * 4 + kMinX] = Math.min(level[i * 4 + kMinX]!, levelBelow[j * 4 + kMinX]!)
          level[i * 4 + kMinY] = Math.min(level[i * 4 + kMinY]!, levelBelow[j * 4 + kMinY]!)
          level[i * 4 + kMaxX] = Math.max(level[i * 4 + kMaxX]!, levelBelow[j * 4 + kMaxX]!)
          level[i * 4 + kMaxY] = Math.max(level[i * 4 + kMaxY]!, levelBelow[j * 4 + kMaxY]!)
        }
      }
    }
  }
}

type PipResult = -1 | 0 | 1

function pointInBBox (point: Point, bbox: BBox) {
  return point[0] >= bbox[kMinX] && point[0] <= bbox[kMaxX] && point[1] >= bbox[kMinY] && point[1] <= bbox[kMaxY]
}

function pointInRingBBoxIndex (point: Point, index: RingBBoxIndex): PipResult {
  if (!pointInBBox(point, index.bbox)) {
    return -1
  }

  let result = -1
  for (let i = 0; i < index.ring.length - 1; i += 1) {
    const segA = index.ring[i]!
    const segB = index.ring[i + 1]!
    const hit = pipHaoSegment(segA, segB, point)
    // On boundary
    if (hit === 0) {
      return 0
    }

    // Flip result if `hit` is 1; do not modify result if `hit` is -1
    result *= -hit
  }

  return result as PipResult
}

function pointInRingNaturalIndex (point: Point, index: RingNaturalIndex): PipResult {
  if (!pointInBBox(point, index.bbox)) {
    return -1
  }

  return pointInNaturalIndexBranch(point, index, 0, 0)

  function pointInNaturalIndexBranch (
    point: Point,
    index: RingNaturalIndex,
    depth: number,
    branchStart: number,
  ): PipResult {
    if (depth === index.levels.length) {
      return pointInLeafLevel(point, index.ring, branchStart)
    }

    const level = index.levels[depth]!
    const end = Math.min(branchStart + kIndexSpread, level.length / 4)
    let result = -1
    for (let i = branchStart; i < end; i += 1) {
      // const minX = level[i * 4 + kMinX]!
      const minY = level[i * 4 + kMinY]!
      // const maxX = level[i * 4 + kMaxX]!
      const maxY = level[i * 4 + kMaxY]!

      if (point[1] < minY || point[1] > maxY) {
        continue
      }

      // XXX: Honestly I'm very confused about this condition: if a point is to the _right_ of a segment,
      // even if it is "outside" the segment box, a segment in that box _can_ cause the point to be a hit,
      // so why does tg exclude it here?
      // Notably, my code does not work if I include this. Anecdotally I find the performance acceptable
      // without this check.

      /*
      if (point[0] > maxX) {
        if (minY !== maxY && minX !== maxX) {
          continue
        }
      }
      */

      // XXX: One thing that's worth checking wrt above is: what if I use the tg pip check instead of the
      // hao one? It could be that they behave differently? Though I think the condition excludes whole
      // branches, so I'm not sure what difference it could make.

      const hit = pointInNaturalIndexBranch(point, index, depth + 1, i * kIndexSpread)
      // On boundary
      if (hit === 0) {
        return 0
      }

      // Flip result if `hit` is 1; do not modify result if `hit` is -1
      result *= -hit
    }

    return result as PipResult
  }

  function pointInLeafLevel (point: Point, ring: Ring, branchStart: number): PipResult {
    const end = Math.min(branchStart + kIndexSpread, ring.length - 1)
    let result = -1
    for (let i = branchStart; i < end; i += 1) {
      const segA = ring[i]!
      const segB = ring[i + 1]!
      const hit = pipHaoSegment(segA, segB, point)
      // On boundary
      if (hit === 0) {
        return 0
      }

      // Flip result if `hit` is 1; do not modify result if `hit` is -1
      result *= -hit
    }
    return result as PipResult
  }
}

export function pointInRingIndex (point: Point, index: RingIndex): PipResult {
  if ('levels' in index) {
    return pointInRingNaturalIndex(point, index)
  }
  return pointInRingBBoxIndex(point, index)
}

export function pointInPolygonIndex (point: Point, index: PolygonIndex): PipResult {
  let result = pointInRingIndex(point, index.exteriorIndex)
  if (result === 1) {
    for (let i = 0; i < index.interiorIndices.length; i += 1) {
      const hit = pointInRingIndex(point, index.interiorIndices[i]!)
      if (hit === 0) {
        return 0
      }

      // If inside a hole, we're not inside the polygon
      if (hit === 1) {
        return -1
      }
    }
  }
  return result
}

export function pointInMultiPolygonIndex (point: Point, index: MultiPolygonIndex): PipResult {
  for (const subindex of index) {
    const hit = pointInPolygonIndex(point, subindex)
    if (hit !== -1) {
      return hit
    }
  }
  return -1
}

/**
 * Evaluate the Hao point-in-polygon algorithm on a single line segment,
 * adapted from https://github.com/rowanwins/point-in-polygon-hao/ (MIT license).
 */
function pipHaoSegment (segA: Point, segB: Point, point: Point) {
  const u1 = segA[0] - point[0]
  const v1 = segA[1] - point[1]
  const u2 = segB[0] - point[0]
  const v2 = segB[1] - point[1]

  if (v1 === 0 && v2 === 0) {
    if ((u2 <= 0 && u1 >= 0) || (u1 <= 0 && u2 >= 0)) {
      return 0
    }
  } else if ((v2 >= 0 && v1 <= 0) || (v2 <= 0 && v1 >= 0)) {
    const f = orient2d(u1, u2, v1, v2, 0, 0)
    if (f === 0) {
      return 0
    }
    if ((f > 0 && v2 > 0 && v1 <= 0) || (f < 0 && v2 <= 0 && v1 > 0)) {
      return 1
    }
  }
  return -1
}

/** Return a bbox whose extents are a single point. */
function toBBox (point: Point): BBox {
  return [point[0], point[1], point[0], point[1]]
}

/** Expand `bbox` to also cover a `point`. */
function expandBBoxPoint (bbox: BBox, point: Point) {
  bbox[kMinX] = Math.min(bbox[kMinX], point[0])
  bbox[kMinY] = Math.min(bbox[kMinY], point[1])
  bbox[kMaxX] = Math.max(bbox[kMaxX], point[0])
  bbox[kMaxY] = Math.max(bbox[kMaxY], point[1])
}

/** Expand `bbox` to also cover `other`. */
function expandBBox (bbox: BBox, other: BBox) {
  bbox[kMinX] = Math.min(bbox[kMinX], other[kMinX])
  bbox[kMinY] = Math.min(bbox[kMinY], other[kMinY])
  bbox[kMaxX] = Math.max(bbox[kMaxX], other[kMaxX])
  bbox[kMaxY] = Math.max(bbox[kMaxY], other[kMaxY])
}
