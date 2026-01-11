import { bench, describe, expect } from 'vitest'
import swedenLand from '../../fixtures/sweden-land.geo.json' with { type: 'json' }
import swedenMaritime from '../../fixtures/sweden-maritime.geo.json' with { type: 'json' }
import swedenSimple from '../../fixtures/sweden-simple.geo.json' with { type: 'json' }
import { createMultiPolygonIndex, createPolygonIndex, pointInMultiPolygonIndex, pointInPolygonIndex } from '.'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

const insideSwedenPoints: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.534346355822375, 56.6975983823752],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.6548471520179, 59.370386357605206],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.72460811522753, 59.330741510174825],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.70840495375349, 59.309461114479824],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.690534267240523, 59.287043665198624],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.68804894567199, 59.282714868923236],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.679421791587114, 59.28221571052605],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.415505538187602, 64.80881936114861],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.135549051897653, 63.45350551098776],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.18651920524888, 63.15107342798074],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.510064332893112, 63.52283899184419],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.75056994527051, 64.30746107187973],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.50919701604887, 61.69331530628995],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.581509803124213, 60.87575638316373],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.024368755338372, 60.57888717251314],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.02443095597801, 61.46933946604333],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.781031928118148, 62.31922117313642],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.28556725504731, 60.29758167204815],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [12.140138646596434, 59.64907325703509],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.584662722100735, 59.53899645019278],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.658027607698418, 58.960293495311795],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.301510704380254, 58.539728313206844],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [13.022815960488357, 57.99447994750418],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [12.095418051663177, 58.38376263266704],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.177687765246644, 57.186404531547986],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [15.659695288393594, 57.45829235156712],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [14.12470296989356, 56.593347381248336],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.561516088927213, 57.50484066025545],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.77155316050372, 57.84443868045313],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.26877995048387, 57.37014622240615],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [19.286506724905227, 58.38321297863334],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.900242452403926, 57.11042447917227],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.221348509628502, 56.580548891403986],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.439161137804913, 56.51561656169382],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [16.745263848366072, 56.88865359809047],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [13.004737816196105, 56.131934873908214],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [12.061688468734117, 57.782912160453314],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.709554143679869, 58.05129971049164],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.030015355915243, 58.895322342469385],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.636858183578184, 57.69250245927827],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.63333324220212, 57.733333319930175],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.684506065151663, 57.72724611818596],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.787274076929869, 57.60309722982085],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [22.352933434215583, 65.55064685307225],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [23.7585598372354, 65.71430209589218],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.876783031836553, 63.78183055281036],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.89113095949323, 63.71570638036786],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.34696412582258, 63.71690579757519],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.375309341437283, 66.79052452729715],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.504753641168254, 67.33217568404343],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [19.37903069789531, 67.86806774741065],
      },
    },
  ],
}

const outsideSwedenPoints: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.558704977312516, 59.878611731730125],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.91972158407645, 57.40611270904566],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.436643637643709, 58.19547831041187],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [12.491276848740116, 60.13826365245357],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [11.490586933391304, 58.90923280149618],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [18.35684866131157, 60.280329938920495],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.352454677893114, 63.71180483068952],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [20.338767032479165, 63.71118525985131],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [23.812613857047786, 65.74827323073397],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [24.126647870106307, 65.85912481195551],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [24.126674350698845, 65.85921435927723],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [19.72310893852253, 68.48274432805908],
      },
    },
  ],
}

/*
const allPoints: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [
    ...insideSwedenPoints.features,
    ...outsideSwedenPoints.features,
  ],
}
*/

describe('create multiPolygon index', () => {
  bench('create index', () => {
    const _index = createMultiPolygonIndex(swedenLand.features[0].geometry.coordinates)
  })
})

describe('very complex multi-polygon', () => {
  const index = createMultiPolygonIndex(swedenLand.features[0].geometry.coordinates)

  bench('search index', () => {
    for (const point of insideSwedenPoints.features) {
      expect(pointInMultiPolygonIndex(point.geometry.coordinates, index)).toBe(1)
    }
    for (const point of outsideSwedenPoints.features) {
      expect(pointInMultiPolygonIndex(point.geometry.coordinates, index)).toBe(-1)
    }
  })

  bench('search with turf, unindexed', () => {
    for (const point of insideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenLand.features[0])).toBe(true)
    }
    for (const point of outsideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenLand.features[0])).toBe(false)
    }
  })
})

describe('create mainland maritime borders polygon index', () => {
  bench('create index', () => {
    const _index = createPolygonIndex(swedenMaritime.features[0].geometry.coordinates)
  })
})

describe('sweden mainland maritime borders polygon', () => {
  const index = createPolygonIndex(swedenMaritime.features[0].geometry.coordinates)

  bench('search index', () => {
    // Not actually asserting the result here because it will be different from the land border polygon :)
    for (const point of insideSwedenPoints.features) {
      expect(pointInPolygonIndex(point.geometry.coordinates, index)).toBeTypeOf('number')
    }
    for (const point of outsideSwedenPoints.features) {
      expect(pointInPolygonIndex(point.geometry.coordinates, index)).toBeTypeOf('number')
    }
  })

  bench('search with turf, unindexed', () => {
    // Not actually asserting the result here because it will be different from the land border polygon :)
    for (const point of insideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenMaritime.features[0])).toBeTypeOf('boolean')
    }
    for (const point of outsideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenMaritime.features[0])).toBeTypeOf('boolean')
    }
  })
})

describe('create simplified maritime borders polygon index', () => {
  bench('create index', () => {
    const _index = createPolygonIndex(swedenSimple.features[0].geometry.coordinates)
  })
})

describe('sweden mainland very simplified maritime borders polygon', () => {
  const index = createPolygonIndex(swedenSimple.features[0].geometry.coordinates)

  bench('search index', () => {
    // Not actually asserting the result here because it will be different from the land border polygon :)
    for (const point of insideSwedenPoints.features) {
      expect(pointInPolygonIndex(point.geometry.coordinates, index)).toBeTypeOf('number')
    }
    for (const point of outsideSwedenPoints.features) {
      expect(pointInPolygonIndex(point.geometry.coordinates, index)).toBeTypeOf('number')
    }
  })

  bench('search with turf, unindexed', () => {
    // Not actually asserting the result here because it will be different from the land border polygon :)
    for (const point of insideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenSimple.features[0])).toBeTypeOf('boolean')
    }
    for (const point of outsideSwedenPoints.features) {
      expect(booleanPointInPolygon(point, swedenSimple.features[0])).toBeTypeOf('boolean')
    }
  })
})
