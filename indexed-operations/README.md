# indexed-operations

Geometry library for point-in-polygon checks, adapting techniques from [tg](https://github.com/tidwall/tg).

This is an alpha-quality library, experimentally in use in some projects. Please do your own testing and benchmarking before you use this in production.
Once stable, more features, documentation, and benchmarks will follow.

## Usage

Create an index based on coordinate arrays, then you can use the index to do a fast point-in-polygon check:

```typescript
import { createPolygonIndex, pointInPolygonIndex } from 'indexed-operations'

declare const polygon: GeoJSON.Polygon
const polygonIndex = createPolygonIndex(polygon.coordinates)

const result = pointInPolygonIndex([53.217031067343015, 6.570103006941866], polygonIndex)
switch (result) {
  case 1: console.log('point is inside polygon'); break
  case 0: console.log('point is on the border of the polygon'); break
  case -1: console.log('point is outside polygon'); break
}
```

You can do the same for a multi-polygon:

```typescript
import { createMultiPolygonIndex, pointInMultiPolygonIndex } from 'indexed-operations'

declare const polygon: GeoJSON.MultiPolygon
const polygonIndex = createMultiPolygonIndex(polygon.coordinates)

const result = pointInMultiPolygonIndex([53.217031067343015, 6.570103006941866], polygonIndex)
switch (result) {
  case 1: console.log('point is inside one of the polygons'); break
  case 0: console.log('point is on the border of one of the polygons'); break
  case -1: console.log('point is outside all polygons'); break
}
```

## License

ⓒ Renée Kooi · Dual-licensed under [Apache-2.0](./LICENSE-APACHE) or [MIT](./LICENSE-MIT) at your option.
