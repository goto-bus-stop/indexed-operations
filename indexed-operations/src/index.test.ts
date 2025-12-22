import { describe, expect, test } from 'vitest'
import { createPolygonIndex, pointInPolygonIndex, type Point, type Polygon } from './index'

function inside (point: Point, polygon: Polygon) {
  const index = createPolygonIndex(polygon)
  return pointInPolygonIndex(point, index)
}

// Tests adapted from point-in-polygon-hao:
// https://github.com/rowanwins/point-in-polygon-hao/blob/fe5b8fcb8455956f726940cde3dcb21357196abe/test/floatingPoint.test.js
describe('floatingPoint', () => {
  // Inspiration drawn from TurfJS issue
  // https://github.com/Turfjs/turf/issues/1597

  const polygon: [number, number][][] = [[
    [-115.1752628, 36.0873974],
    [-115.1752969, 36.0873974],
    [-115.1752969, 36.0874526],
    [-115.1752628, 36.0874526],
    [-115.1752628, 36.0873974],
  ]]

  test('is on edge poly', () => {
    expect(inside([-115.1752799, 36.0874526], polygon)).toBe(0)
  })

  test('is on other edge poly', () => {
    expect(inside([-115.1752799, 36.0873974], polygon)).toBe(0)
  })

  const shiftedPoly: [number, number][][] = [[
    [-115.1752628, 36.0873974],
    [-115.1752969, 36.0873974],
    [-115.1752969, 36.0874528],
    [-115.1752628, 36.0874528],
    [-115.1752628, 36.0873974],
  ]]

  test('is on edge slightly tweaked poly', () => {
    expect(inside([-115.1752799, 36.0874528], shiftedPoly)).toBe(0)
  })

  test('is on other edge slightly tweaked poly', () => {
    expect(inside([-115.1752799, 36.0873974], shiftedPoly)).toBe(0)
  })

  // https://github.com/mikolalysenko/robust-point-in-polygon/issues/2
  test('complex case', () => {
    expect(inside([16.8, 16.8], [
      [
        [0.9500000000001119, 0.9500000000001101],
        [18, 18],
        [18, 0.95],
        [0.9500000000001119, 0.9500000000001101],
      ],
    ])).toBe(-1)
  })

  // https://github.com/rowanwins/point-in-polygon-hao/issues/19
  test('complex case #2', () => {
    const polygon: [number, number][][] = [[
      [51.65906944711844, 32.644344469605144],
      [51.643474062027934, 32.64597280574026],
      [51.6602114368668, 32.658994206590506],
      [51.64382208072604, 32.65965256535195],
      [51.65906944711844, 32.644344469605144],
    ]]

    const point: [number, number] = [51.6476999685446, 32.65383784687809]
    expect(inside(point, polygon)).toBe(-1)
  })
})

// https://github.com/rowanwins/point-in-polygon-hao/blob/fe5b8fcb8455956f726940cde3dcb21357196abe/test/floatingPointSimpler.test.js
describe('floatingPointSimpler', () => {
  const polygon: [number, number][][] = [[
    [1.111111111111, 1.111111111111],
    [1.111111111111, 2.111111111111],
    [2.111111111111, 2.111111111111],
    [2.111111111111, 1.111111111111],
    [1.111111111111, 1.111111111111],
  ]]

  test('is on bottom edge poly', () => {
    expect(inside([1.511111111111, 1.111111111111], polygon)).toBe(0)
  })

  test('is on top edge poly', () => {
    expect(inside([1.511111111111, 2.111111111111], polygon)).toBe(0)
  })

  test('is on left edge poly', () => {
    expect(inside([1.111111111111, 1.511111111111], polygon)).toBe(0)
  })

  test('is on right edge poly', () => {
    expect(inside([2.111111111111, 1.511111111111], polygon)).toBe(0)
  })

  test('is just inside left edge', () => {
    expect(inside([1.1111111111111, 1.511111111111], polygon)).toBe(1)
  })

  test('is just outside left edge', () => {
    expect(inside([1.111111111110, 1.511111111111], polygon)).toBe(-1)
  })
})
