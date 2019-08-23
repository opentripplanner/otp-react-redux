"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSortedRouteIds = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.values");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.find-index");

var _reselect = require("reselect");

var _itinerary = require("../util/itinerary");

function operatorIndexForRoute(operators, route) {
  var index = operators.findIndex(function (o) {
    return o && o.id.toLowerCase() === route.agencyId.split(':')[0].toLowerCase();
  });
  if (index !== -1 && typeof operators[index].order !== 'undefined') return operators[index].order;else return 0;
}

var selectBasicRoutes = (0, _reselect.createSelector)(function (state) {
  return state.otp.transitIndex.routes;
}, function (routes) {
  return Object.values(routes || []).sort(_itinerary.routeComparator).map(function (route) {
    var agency = route.agency,
        id = route.id;
    return {
      id: id,
      agencyId: agency ? agency.id : ''
    };
  });
});
var getSortedRouteIds = (0, _reselect.createSelector)([selectBasicRoutes, function (state) {
  return state.otp.config.operators;
}], function (routes, operators) {
  if (!routes) return [];
  console.log('selecting routes');
  var agencySortedRoutes = operators.length > 0 ? routes.sort(function (a, b) {
    return operatorIndexForRoute(operators, a) - operatorIndexForRoute(operators, b);
  }) : routes;
  return agencySortedRoutes.map(function (r) {
    return r.id;
  });
});
exports.getSortedRouteIds = getSortedRouteIds;

//# sourceMappingURL=index.js