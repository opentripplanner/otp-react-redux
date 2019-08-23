"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMobile = isMobile;
exports.isIE = isIE;
exports.enableScrollForSelector = enableScrollForSelector;
exports.getTitle = getTitle;

require("core-js/modules/es6.function.name");

var _bowser = _interopRequireDefault(require("bowser"));

var _ui = require("../actions/ui");

var _query = require("./query");

var _state = require("./state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set default title to the original document title (on load) set in index.html
var DEFAULT_TITLE = document.title;

function isMobile() {
  // TODO: consider using 3rd-party library?
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
/**
 * Returns true if the user is using a [redacted] browser
 */


function isIE() {
  return _bowser.default.name === 'Internet Explorer';
}
/**
 * Enables scrolling for a specified selector, while disabling scrolling for all
 * other targets. This is adapted from https://stackoverflow.com/a/41601290/915811
 * and intended to fix issues with iOS elastic scrolling, e.g.,
 * https://github.com/conveyal/trimet-mod-otp/issues/92.
 */


function enableScrollForSelector(selector) {
  var _overlay = document.querySelector(selector);

  var _clientY = null; // remember Y position on touch start

  _overlay.addEventListener('touchstart', function (event) {
    if (event.targetTouches.length === 1) {
      // detect single touch
      _clientY = event.targetTouches[0].clientY;
    }
  }, false);

  _overlay.addEventListener('touchmove', function (event) {
    if (event.targetTouches.length === 1) {
      // detect single touch
      disableRubberBand(event);
    }
  }, false);

  function disableRubberBand(event) {
    var clientY = event.targetTouches[0].clientY - _clientY;

    if (_overlay.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll
      event.preventDefault();
    }

    if (isOverlayTotallyScrolled() && clientY < 0) {
      // element is at the top of its scroll
      event.preventDefault();
    }
  }

  function isOverlayTotallyScrolled() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
    return _overlay.scrollHeight - _overlay.scrollTop <= _overlay.clientHeight;
  }
}

function getTitle(state) {
  // Override title can optionally be provided in config.yml
  var _state$otp = state.otp,
      config = _state$otp.config,
      ui = _state$otp.ui,
      user = _state$otp.user;
  var title = config.title || DEFAULT_TITLE;
  var mainPanelContent = ui.mainPanelContent,
      viewedRoute = ui.viewedRoute,
      viewedStop = ui.viewedStop;

  switch (mainPanelContent) {
    case _ui.MainPanelContent.ROUTE_VIEWER:
      title += ' | Route';
      if (viewedRoute && viewedRoute.routeId) title += " ".concat(viewedRoute.routeId);
      break;

    case _ui.MainPanelContent.STOP_VIEWER:
      title += ' | Stop';
      if (viewedStop && viewedStop.stopId) title += " ".concat(viewedStop.stopId);
      break;

    default:
      var activeSearch = (0, _state.getActiveSearch)(state.otp);

      if (activeSearch) {
        title += " | ".concat((0, _query.summarizeQuery)(activeSearch.query, user.locations));
      }

      break;
  } // if (printView) title += ' | Print'


  return title;
}

//# sourceMappingURL=ui.js