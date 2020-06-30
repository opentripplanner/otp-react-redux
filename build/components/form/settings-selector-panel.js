"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.starts-with");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _form = require("../../actions/form");

var _generalSettingsPanel = _interopRequireDefault(require("./general-settings-panel"));

var _icon = _interopRequireDefault(require("../narrative/icon"));

var _modeButton = _interopRequireDefault(require("./mode-button"));

var _itinerary = require("../../util/itinerary");

var _query = require("../../util/query");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SettingsSelectorPanel =
/*#__PURE__*/
function (_Component) {
  _inherits(SettingsSelectorPanel, _Component);

  function SettingsSelectorPanel(props) {
    var _this;

    _classCallCheck(this, SettingsSelectorPanel);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SettingsSelectorPanel).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_setWalkOnly", function () {
      _this._setSoloMode('WALK');
    });

    _defineProperty(_assertThisInitialized(_this), "_setBikeOnly", function () {
      _this._setSoloMode('BICYCLE');
    });

    _defineProperty(_assertThisInitialized(_this), "_setMicromobilityOnly", function () {
      _this._setSoloMode('MICROMOBILITY');
    });

    _defineProperty(_assertThisInitialized(_this), "_replaceOwnMode", function (newMode, referenceOwnMode) {
      var _this$props = _this.props,
          queryModes = _this$props.queryModes,
          setQueryParam = _this$props.setQueryParam;
      var nonOwnModes = queryModes.filter(function (m) {
        return !m.startsWith(referenceOwnMode);
      });
      setQueryParam({
        mode: [].concat(_toConsumableArray(nonOwnModes), [newMode]).join(',')
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_setOwnBike", function () {
      return _this._replaceOwnMode('BICYCLE', 'BICYCLE');
    });

    _defineProperty(_assertThisInitialized(_this), "_setRentedBike", function () {
      return _this._replaceOwnMode('BICYCLE_RENT', 'BICYCLE');
    });

    _defineProperty(_assertThisInitialized(_this), "_setOwnMicromobility", function () {
      return _this._replaceOwnMode('MICROMOBILITY', 'MICROMOBILITY');
    });

    _defineProperty(_assertThisInitialized(_this), "_setRentedMicromobility", function () {
      _this._replaceOwnMode('MICROMOBILITY_RENT', 'MICROMOBILITY');

      _this.props.setQueryParam({
        companies: _this._getCompaniesForMode('MICROMOBILITY_RENT')
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_getCompaniesForMode", function (modeStr) {
      var config = _this.props.config;
      return config.companies.filter(function (co) {
        return co.modes.indexOf(modeStr) > -1;
      }).map(function (co) {
        return co.id;
      }).join(',');
    });

    _defineProperty(_assertThisInitialized(_this), "_toggleStoredSettings", function () {
      var options = (0, _query.getTripOptionsFromQuery)(_this.props.query); // If user defaults are set, clear them. Otherwise, store them.

      if (_this.props.defaults) _this.props.clearDefaultSettings();else _this.props.storeDefaultSettings(options);
    });

    _defineProperty(_assertThisInitialized(_this), "_resetForm", function () {
      return _this.props.resetForm();
    });

    _defineProperty(_assertThisInitialized(_this), "_setAccessMode", function (mode) {
      var _this$props2 = _this.props,
          config = _this$props2.config,
          queryModes = _this$props2.queryModes;
      var newQueryModes = queryModes.slice(0); // Clone the modes array

      var modeStr = mode.mode || mode; // Create object to contain multiple parameter updates if needed (i.e. 'mode', 'compainies')

      var queryParamUpdate = {};

      if (_this._lastTransitMode) {
        // Restore previous transit selection, if present
        newQueryModes = _this._lastTransitMode.split(',').filter(function (m) {
          return !(0, _itinerary.isAccessMode)(m);
        });
        _this._lastTransitMode = null;
      } else {
        // Otherwise, retain any currently selected transit modes
        newQueryModes = newQueryModes.filter(function (m) {
          return !(0, _itinerary.isAccessMode)(m);
        });
      } // If no transit modes selected, select all


      if (!newQueryModes || newQueryModes.length === 0) {
        newQueryModes = (0, _itinerary.getTransitModes)(config);
      } // Add the access mode


      newQueryModes.push(modeStr); // apply needed companies to query

      queryParamUpdate.companies = mode.company // mode is associated with a specific company
      ? mode.company.toUpperCase() // mode is either a rental or hailing mode, but not associated with
      // a specific company
      : (0, _itinerary.hasRental)(modeStr) || (0, _itinerary.hasHail)(modeStr) ? // when switching, add all companies at first
      _this._getCompaniesForMode(modeStr) // mode is not renting or hailing and not associated with any company
      : null;
      queryParamUpdate.mode = newQueryModes.join(',');

      _this.props.setQueryParam(queryParamUpdate);
    });

    _defineProperty(_assertThisInitialized(_this), "_renderCompanies", function () {
      var _this$props3 = _this.props,
          queryCompanies = _this$props3.companies,
          config = _this$props3.config,
          icons = _this$props3.icons,
          mode = _this$props3.mode;
      var configCompanies = config.companies,
          modes = config.modes;
      var accessModes = modes.accessModes; // check if a single company has an exclusive button

      if (queryCompanies && accessModes.some(function (accessMode) {
        return accessMode.company === queryCompanies.toUpperCase();
      })) {
        // a match has been found for an access mode that exclusively belongs to
        // a particular company
        return null;
      } // hack for TriMet-MOD project, don't show companies if Biketown enabled
      // when using just bike rentals


      if (mode && mode.indexOf('BICYCLE_RENT') > -1) {
        return null;
      } // check if renting or hailing


      if ((0, _itinerary.hasRental)(mode) || (0, _itinerary.hasHail)(mode)) {
        var queryModes = mode.split(',');
        var activeCompanies = configCompanies.filter(function (company) {
          return company.modes.split(',').some(function (companyMode) {
            return queryModes.indexOf(companyMode) > -1;
          });
        });
        return _react.default.createElement("div", {
          style: {
            marginBottom: 16
          }
        }, _react.default.createElement("div", {
          className: "setting-label"
        }, "Use Companies"), _react.default.createElement("div", {
          style: {
            textAlign: 'left'
          }
        }, activeCompanies.length === 0 && _react.default.createElement("p", null, "No comapnies available for this mode!"), activeCompanies.map(function (company) {
          var classNames = ['select-button'];
          if (_this._companyIsActive(company)) classNames.push('active');
          return _react.default.createElement(_reactBootstrap.Button, {
            key: company.id,
            className: classNames.join(' '),
            style: {
              marginTop: 3,
              marginBottom: 3,
              marginLeft: 0,
              marginRight: 5
            },
            onClick: function onClick() {
              return _this._toggleCompany(company.id);
            }
          }, _react.default.createElement("div", {
            className: "mode-icon",
            style: {
              display: 'inline-block',
              fill: '#000',
              width: 16,
              height: 16,
              marginRight: 5,
              verticalAlign: 'middle'
            }
          }, (0, _itinerary.getIcon)(company.id, icons)), company.label);
        })), _react.default.createElement("div", {
          style: {
            clear: 'both'
          }
        }));
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_renderExclusiveAccessSelectors", function () {
      var _this$props4 = _this.props,
          config = _this$props4.config,
          mode = _this$props4.mode,
          icons = _this$props4.icons;
      var exclusiveModes = config.modes.exclusiveModes;
      var modeHasTransit = (0, _itinerary.hasTransit)(mode); // Use int for array element keys

      var key = 0;
      if (!exclusiveModes) return null; // create an array of children to display within a mode-group-row
      // at most 2 exclusive modes will be displayed side-by-side

      var children = [];

      var spacer = function spacer() {
        return _react.default.createElement(_reactBootstrap.Col, {
          xs: 2,
          key: key++,
          style: {
            height: 44
          }
        }, "\xA0");
      };

      exclusiveModes.forEach(function (exclusiveMode, idx) {
        // add left padding for every evenly indexed exclusiveMode
        if (idx % 2 === 0) {
          children.push(spacer());
        }

        switch (exclusiveMode) {
          case 'WALK':
            children.push(_react.default.createElement(_reactBootstrap.Col, {
              key: key++,
              xs: 4
            }, _react.default.createElement(_modeButton.default, {
              enabled: true,
              key: key++,
              active: mode === 'WALK',
              icons: icons,
              mode: 'WALK',
              height: 36,
              label: 'Walk Only',
              inlineLabel: true,
              onClick: _this._setWalkOnly
            })));
            break;

          case 'BICYCLE':
            children.push(_react.default.createElement(_reactBootstrap.Col, {
              key: key++,
              xs: 4
            }, _react.default.createElement(_modeButton.default, {
              enabled: true,
              key: key++,
              active: !modeHasTransit && (0, _itinerary.hasBike)(mode),
              icons: icons,
              mode: 'BICYCLE',
              height: 36,
              label: 'Bike Only',
              inlineLabel: true,
              onClick: _this._setBikeOnly
            })));
            break;

          case 'MICROMOBILITY':
            children.push(_react.default.createElement(_reactBootstrap.Col, {
              key: key++,
              xs: 4
            }, _react.default.createElement(_modeButton.default, {
              enabled: true,
              key: key++,
              active: !modeHasTransit && (0, _itinerary.hasMicromobility)(mode),
              icons: icons,
              mode: 'MICROMOBILITY',
              height: 36,
              label: 'E-scooter Only',
              inlineLabel: true,
              onClick: _this._setMicromobilityOnly
            })));
            break;

          default:
            throw new Error("Unsupported exclusive mode: ".concat(exclusiveMode));
        } // add right padding for every odd indexed exclusiveMode


        if (idx % 2 !== 0) {
          children.push(spacer());
        }
      });
      return _react.default.createElement(_reactBootstrap.Row, {
        className: "mode-group-row"
      }, children);
    });

    _this.state = {
      activePanel: 'MODES'
    };
    return _this;
  } // returns whether a micromobility company is selected or not


  _createClass(SettingsSelectorPanel, [{
    key: "_companyIsActive",
    value: function _companyIsActive(company) {
      var companies = this.props.companies;
      return companies && companies.indexOf(company.id) > -1;
    } // Returns whether a particular mode or TNC agency is active

  }, {
    key: "_modeIsActive",
    value: function _modeIsActive(mode) {
      var _this$props5 = this.props,
          companies = _this$props5.companies,
          queryModes = _this$props5.queryModes;

      if (mode.mode === 'CAR_HAIL' || mode.mode === 'CAR_RENT') {
        return Boolean(companies && mode.company && companies.includes(mode.company.toUpperCase()));
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = queryModes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var m = _step.value;
          if (m === mode.mode) return true;
        } // All transit modes are selected
        // if (isTransit(mode.mode) && queryModes.indexOf('TRANSIT') !== -1) return true

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: "_setSoloMode",
    value: function _setSoloMode(mode) {
      // save current access/transit modes
      if ((0, _itinerary.hasTransit)(this.props.mode)) this._lastTransitMode = this.props.mode;
      this.props.setQueryParam({
        mode: mode
      });
    }
  }, {
    key: "_toggleCompany",
    value: function _toggleCompany(company) {
      var _this$props6 = this.props,
          companies = _this$props6.companies,
          setQueryParam = _this$props6.setQueryParam; // set company if no companies set yet

      if (!companies) {
        setQueryParam({
          companies: company
        });
        return;
      } // add or remove from existing companies


      if (companies.indexOf(company) > -1) {
        // company already present in query, remove
        setQueryParam({
          companies: companies.split(',').filter(function (co) {
            return co !== company;
          }).join(',')
        });
      } else {
        // company not yet present, add to string list
        setQueryParam({
          companies: "".concat(companies, ",").concat(company)
        });
      }
    }
  }, {
    key: "_toggleTransitMode",
    value: function _toggleTransitMode(mode) {
      var _this$props7 = this.props,
          queryModes = _this$props7.queryModes,
          setQueryParam = _this$props7.setQueryParam;
      var modeStr = mode.mode || mode;
      var newQueryModes = queryModes.slice(0); // Clone the modes array
      // do not allow the last transit mode to be deselected

      var transitModes = newQueryModes.filter(function (m) {
        return (0, _itinerary.isTransit)(m);
      });
      if (transitModes.length === 1 && transitModes[0] === modeStr) return; // If mode is currently selected, deselect it

      if (newQueryModes.includes(modeStr)) {
        newQueryModes = newQueryModes.filter(function (m) {
          return m !== modeStr;
        }); // Or, if mode is currently not selected, select it
      } else if (!newQueryModes.includes(modeStr)) {
        newQueryModes.push(modeStr);
      }

      setQueryParam({
        mode: newQueryModes.join(',')
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props8 = this.props,
          config = _this$props8.config,
          defaults = _this$props8.defaults,
          mode = _this$props8.mode,
          icons = _this$props8.icons,
          query = _this$props8.query,
          queryModes = _this$props8.queryModes,
          showUserSettings = _this$props8.showUserSettings;
      var modeHasTransit = (0, _itinerary.hasTransit)(mode);
      var _config$modes = config.modes,
          transitModes = _config$modes.transitModes,
          accessModes = _config$modes.accessModes,
          bicycleModes = _config$modes.bicycleModes,
          micromobilityModes = _config$modes.micromobilityModes; // Do not permit remembering trip options if they do not differ from the
      // defaults and nothing has been stored

      var queryIsDefault = !(0, _query.isNotDefaultQuery)(query, config);
      var rememberIsDisabled = queryIsDefault && !defaults;
      return _react.default.createElement("div", {
        className: "settings-selector-panel"
      }, _react.default.createElement("div", {
        className: "modes-panel"
      }, showUserSettings && _react.default.createElement("div", {
        style: {
          marginBottom: '5px'
        },
        className: "store-settings pull-right"
      }, _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "xsmall",
        disabled: rememberIsDisabled,
        onClick: this._toggleStoredSettings
      }, defaults ? _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "times"
      }), " Forget my options") : _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "lock"
      }), " Remember trip options")), _react.default.createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        bsSize: "xsmall",
        disabled: queryIsDefault && !defaults,
        onClick: this._resetForm
      }, _react.default.createElement(_icon.default, {
        type: "undo"
      }), ' ', "Restore", defaults ? ' my' : '', " defaults")), _react.default.createElement(_reactBootstrap.Row, {
        className: "mode-group-row"
      }, _react.default.createElement(_reactBootstrap.Col, {
        xs: 12
      }, _react.default.createElement(_modeButton.default, {
        enabled: true,
        active: modeHasTransit && this._modeIsActive({
          mode: 'WALK'
        }),
        icons: icons,
        mode: 'TRANSIT',
        height: 54,
        label: 'Take Transit',
        inlineLabel: true,
        onClick: function onClick() {
          return _this2._setAccessMode('WALK');
        }
      }))), _react.default.createElement(_reactBootstrap.Row, {
        className: "mode-group-row"
      }, accessModes.map(function (mode, k) {
        return _react.default.createElement(_reactBootstrap.Col, {
          xs: 4,
          key: k
        }, _react.default.createElement(_modeButton.default, {
          enabled: true,
          active: modeHasTransit && _this2._modeIsActive(mode),
          icons: icons,
          mode: mode,
          height: 46,
          label: mode.label,
          showPlusTransit: true,
          onClick: function onClick() {
            return _this2._setAccessMode(mode);
          }
        }));
      })), this._renderExclusiveAccessSelectors()), _react.default.createElement(_reactBootstrap.Row, null, _react.default.createElement(_reactBootstrap.Col, {
        xs: 12,
        className: "general-settings-panel"
      }, _react.default.createElement("div", {
        style: {
          fontSize: 18,
          margin: '16px 0px'
        }
      }, "Travel Preferences"), (0, _itinerary.hasBike)(mode) && !(0, _itinerary.hasTransit)(mode) && _react.default.createElement("div", {
        style: {
          marginBottom: 16
        }
      }, _react.default.createElement("div", {
        className: "setting-label",
        style: {
          float: 'left'
        }
      }, "Use"), _react.default.createElement("div", {
        style: {
          textAlign: 'right'
        }
      }, bicycleModes.map(function (option, k) {
        var action = _this2._setOwnBike;
        if (option.mode === 'BICYCLE_RENT') action = _this2._setRentedBike;
        var classNames = ['select-button'];
        if (queryModes.includes(option.mode)) classNames.push('active'); // TODO: Handle different bikeshare networks

        return _react.default.createElement(_reactBootstrap.Button, {
          key: k,
          className: classNames.join(' '),
          onClick: action
        }, _react.default.createElement("div", {
          style: {
            display: 'inline-block',
            width: option.iconWidth,
            height: 18,
            fill: '#000',
            verticalAlign: 'middle',
            marginRight: 10
          }
        }, (0, _itinerary.getIcon)(option.mode, icons)), _react.default.createElement("span", {
          style: {
            verticalAlign: 'middle'
          }
        }, option.label));
      }))), (0, _itinerary.hasMicromobility)(mode) && !(0, _itinerary.hasTransit)(mode) && _react.default.createElement("div", {
        style: {
          marginBottom: 16
        }
      }, _react.default.createElement("div", {
        className: "setting-label",
        style: {
          float: 'left'
        }
      }, "Use"), _react.default.createElement("div", {
        style: {
          textAlign: 'right'
        }
      }, micromobilityModes.map(function (option, k) {
        var action = _this2._setOwnMicromobility;
        if (option.mode === 'MICROMOBILITY_RENT') action = _this2._setRentedMicromobility;
        var classNames = ['select-button'];
        if (queryModes.includes(option.mode)) classNames.push('active'); // TODO: Handle different bikeshare networks

        return _react.default.createElement(_reactBootstrap.Button, {
          key: k,
          className: classNames.join(' '),
          onClick: action
        }, _react.default.createElement("div", {
          style: {
            display: 'inline-block',
            width: option.iconWidth,
            height: 18,
            fill: '#000',
            verticalAlign: 'middle',
            marginRight: 10
          }
        }, (0, _itinerary.getIcon)(option.mode, icons)), _react.default.createElement("span", {
          style: {
            verticalAlign: 'middle'
          }
        }, option.label));
      }))), this._renderCompanies(), (0, _itinerary.hasTransit)(mode) && _react.default.createElement("div", {
        style: {
          marginBottom: 16
        }
      }, _react.default.createElement("div", {
        className: "setting-label"
      }, "Use"), _react.default.createElement("div", {
        style: {
          textAlign: 'left'
        }
      }, transitModes.map(function (mode, k) {
        var classNames = ['select-button'];
        if (_this2._modeIsActive(mode)) classNames.push('active');
        return _react.default.createElement(_reactBootstrap.Button, {
          key: mode.mode,
          className: classNames.join(' '),
          style: {
            marginTop: 3,
            marginBottom: 3,
            marginLeft: 0,
            marginRight: 5
          },
          onClick: function onClick() {
            return _this2._toggleTransitMode(mode);
          }
        }, _react.default.createElement("div", {
          className: "mode-icon",
          style: {
            display: 'inline-block',
            fill: '#000',
            width: 16,
            height: 16,
            marginRight: 5,
            verticalAlign: 'middle'
          }
        }, (0, _itinerary.getIcon)(mode.mode, icons)), mode.label);
      })), _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      })), _react.default.createElement(_generalSettingsPanel.default, null))));
    }
  }]);

  return SettingsSelectorPanel;
}(_react.Component); // connect to redux store


_defineProperty(SettingsSelectorPanel, "propTypes", {
  icons: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp = state.otp,
      config = _state$otp.config,
      currentQuery = _state$otp.currentQuery,
      user = _state$otp.user;
  var defaults = user.defaults;
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  var companies = currentQuery.companies,
      mode = currentQuery.mode,
      routingType = currentQuery.routingType;
  return {
    defaults: defaults,
    query: currentQuery,
    config: config,
    mode: mode,
    companies: companies,
    modeGroups: config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType: routingType,
    showUserSettings: showUserSettings
  };
};

var mapDispatchToProps = {
  clearDefaultSettings: _form.clearDefaultSettings,
  resetForm: _form.resetForm,
  setQueryParam: _form.setQueryParam,
  storeDefaultSettings: _form.storeDefaultSettings
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(SettingsSelectorPanel);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=settings-selector-panel.js