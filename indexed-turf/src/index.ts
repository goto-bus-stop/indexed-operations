import { createMultiPolygonIndex, createPolygonIndex, pointInPolygonIndex, pointInMultiPolygonIndex } from 'indexed-operations'
import { getCoord, getGeom } from '@turf/invariant'
import type { Coord } from '@turf/helpers'
import type { Feature, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from 'geojson'

const kIndex = Symbol.for('indexed-operations.index')

type IndexTypes = {
  Polygon: ReturnType<typeof createPolygonIndex>,
  MultiPolygon: ReturnType<typeof createMultiPolygonIndex>,
}

type IndexFor<T extends Geometry> = T['type'] extends keyof IndexTypes ? IndexTypes[T['type']] : never

function setIndex <T extends Geometry> (geometry: T, index: IndexFor<T>) {
  Object.defineProperty(geometry, kIndex, { value: index })
}

function getIndex <T extends Geometry> (geometry: T) {
  return (geometry as T & { [kIndex]: IndexFor<T> })[kIndex]
}

function ensureIndex <T extends Geometry> (geometry: T, make: () => IndexFor<T>) {
  const index = getIndex(geometry)
  if (index != null) {
    return index
  }

  setIndex(geometry, make())
  return getIndex(geometry)
}

/** 2D coordinates only!! */
export function booleanPointInPolygon<
  P extends GeoJsonProperties = GeoJsonProperties,
>(
  point: Coord,
  polygon: Feature<Polygon | MultiPolygon, P> | Polygon | MultiPolygon,
  options: {
    ignoreBoundary?: boolean
  } = {}
) {
  const pt = getCoord(point) as [number, number]
  const geom = getGeom(polygon)

  let result
  if (geom.type === 'Polygon') {
    const index = ensureIndex(geom, () => createPolygonIndex(geom.coordinates as [number, number][][]))
    result = pointInPolygonIndex(pt, index)
  } else if (geom.type === 'MultiPolygon') {
    const index = ensureIndex(geom, () => createMultiPolygonIndex(geom.coordinates as [number, number][][][]))
    result = pointInMultiPolygonIndex(pt, index)
  }

  if (result === 0) {
    return options.ignoreBoundary ? false : true
  }
  if (result === 1) {
    return true
  }
  return false
}
