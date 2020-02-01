import {isTransit, makeRouteComparator} from '../../lib/util/itinerary'

const {
  route1,
  route2,
  route3,
  route4,
  route5,
  route6,
  route7,
  route8,
  route9,
  route10,
  route11,
  route12,
  route13
} = require('./__mocks__/itinerary.json')

function sortRoutes (...routes) {
  routes.sort(makeRouteComparator())
  return routes
}

describe('util > itinerary', () => {
  it('isTransit should work', () => {
    expect(isTransit('CAR')).toBeFalsy()
  })

  describe('routeComparator', () => {
    it('should sort routes based off of sortOrder', () => {
      expect(sortRoutes(route1, route2)).toMatchSnapshot()
    })

    it('should prioritize routes with valid sortOrder', () => {
      expect(sortRoutes(route2, route3)).toMatchSnapshot()
    })

    it('should sort routes based off of integer shortName with routes with same sortOrder', () => {
      expect(sortRoutes(route8, route2)).toMatchSnapshot()
    })

    it('should sort routes based off of integer shortName', () => {
      expect(sortRoutes(route3, route4)).toMatchSnapshot()
    })

    it('should prioritize routes with valid integer shortNames', () => {
      expect(sortRoutes(route4, route5)).toMatchSnapshot()
    })

    it('should sort routes based off of shortNames', () => {
      expect(sortRoutes(route5, route6)).toMatchSnapshot()
    })

    it('should prioritize routes with shortNames over those with just longNames', () => {
      expect(sortRoutes(route6, route7)).toMatchSnapshot()
    })

    it('should sort routes based off of longNames', () => {
      expect(sortRoutes(route9, route10)).toMatchSnapshot()
    })

    it('should sort routes on all of the criteria at once', () => {
      expect(sortRoutes(
        route1,
        route2,
        route3,
        route4,
        route5,
        route6,
        route7,
        route8,
        route9,
        route10,
        route11,
        route12,
        route13
      )).toMatchSnapshot()
    })

    it('should skip integer short name criteria when specified', () => {
      const routes = [route10, route11]
      routes.sort(makeRouteComparator(false))
      expect(routes).toMatchSnapshot()
    })

    it('should sort based off of route type', () => {
      const routes = [route12, route13]
      routes.sort(makeRouteComparator(false))
      expect(routes).toMatchSnapshot()
    })
  })
})
