import lonlat from '@conveyal/lonlat'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { FormGroup, FormControl, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { autocomplete, search } from 'isomorphic-mapzen-search'

import { setLocation, setLocationToCurrent, clearLocation } from '../../actions/map'
import { addLocationSearch, getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
import { distanceStringImperial } from '../../util/distance'

class LocationField extends Component {
  static propTypes = {
    config: PropTypes.object,
    currentPosition: PropTypes.object,
    hideExistingValue: PropTypes.bool,
    location: PropTypes.object,
    label: PropTypes.string,
    nearbyStops: PropTypes.array,
    sessionSearches: PropTypes.array,
    showClearButton: PropTypes.bool,
    static: PropTypes.bool, // show autocomplete options as fixed/inline element rather than dropdown
    stopsIndex: PropTypes.object,
    type: PropTypes.string, // replace with locationType?

    // callbacks
    onClick: PropTypes.func,
    onLocationSelected: PropTypes.func,

    // dispatch
    addLocationSearch: PropTypes.func,
    clearLocation: PropTypes.func,
    setLocation: PropTypes.func,
    setLocationToCurrent: PropTypes.func
  }

  static defaultProps = {
    showClearButton: true
  }

  constructor (props) {
    super(props)
    this.state = {
      value: props.location !== null && !props.hideExistingValue
        ? props.location.name
        : '',
      menuVisible: false,
      geocodedFeatures: [],
      activeIndex: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.setState({
        value: nextProps.location !== null ? nextProps.location.name : '',
        geocodedFeatures: []
      })
    }
  }

  componentDidMount () {
    if (this.props.static) {
      ReactDOM.findDOMNode(this.formControl).focus()
    }
  }

  _geocodeAutocomplete (text) {
    const {MAPZEN_KEY, baseUrl, boundary, focusPoint} = this.props.config.geocoder
    autocomplete({
      apiKey: MAPZEN_KEY,
      boundary,
      focusPoint,
      sources: null,
      text,
      url: baseUrl ? `${baseUrl}/autocomplete` : null
    }).then((result) => {
      console.log(result)
      this.setState({ geocodedFeatures: result.features })
    }).catch((err) => {
      console.error(err)
    })
  }

  _geocodeSearch (text) {
    const {MAPZEN_KEY, baseUrl, boundary, focusPoint} = this.props.config.geocoder
    search({
      apiKey: MAPZEN_KEY,
      boundary,
      focusPoint,
      text,
      sources: null,
      url: baseUrl ? `${baseUrl}/search` : null,
      format: false // keep as returned GeoJSON
    }).then((result) => {
      console.log('search results', result)
      this.setState({ geocodedFeatures: result.features })
    }).catch((err) => {
      console.error(err)
    })
  }

  _getFormControlClassname () {
    return this.props.type + '-form-control'
  }

  _onClearButtonClick = () => {
    const { type } = this.props
    this.props.clearLocation({ type })
    this.setState({
      value: '',
      geocodedFeatures: []
    })
    ReactDOM.findDOMNode(this.formControl).focus()
  }

  _onDropdownToggle = (v, e) => {
    // if clicked on input form control, keep dropdown open; otherwise, toggle
    const targetIsInput =
      e.target.className.indexOf(this._getFormControlClassname()) !== -1
    const menuVisible = targetIsInput ? true : !this.state.menuVisible
    this.setState({ menuVisible })
  }

  _onTextInputChange = (evt) => {
    this.setState({ value: evt.target.value })
    this._geocodeAutocomplete(evt.target.value)
  }

  _onTextInputClick = () => {
    const { currentPosition, onClick } = this.props
    if (typeof onClick === 'function') onClick()
    this.setState({ menuVisible: true })
    if (currentPosition) {
      this.props.findNearbyStops({
        lat: currentPosition.coords.latitude,
        lon: currentPosition.coords.longitude
      })
    }
  }

  _onKeyDown = (evt) => {
    const { activeIndex } = this.state

    switch (evt.key) {
      // 'Down' arrow key pressed: move selected menu item down by one position
      case 'ArrowDown':
        if (activeIndex === this.menuItemCount - 1) {
          this.setState({ activeIndex: null })
          break
        }
        this.setState({
          activeIndex: activeIndex === null
            ? 0
            : activeIndex + 1
        })
        break

      // 'Up' arrow key pressed: move selection up by one position
      case 'ArrowUp':
        if (activeIndex === 0) {
          this.setState({ activeIndex: null })
          break
        }
        this.setState({
          activeIndex: activeIndex === null
            ? this.menuItemCount - 1
            : activeIndex - 1
        })
        break

      // 'Enter' keypress serves two purposes:
      //  - If pressed when typing in search string, switch from 'autocomplete'
      //    to 'search' geocosing
      //  - If pressed when dropdown results menu is active, apply the location
      //    associated with current selected menu item
      case 'Enter':
        if (activeIndex) { // Menu is active
          // Retrieve location selection handler from lookup object and invoke
          const locationSelected = this.locationSelectedLookup[activeIndex]
          if (locationSelected) locationSelected()

          // Clear selection & hide the menu
          this.setState({
            menuVisible: false,
            activeIndex: null
          })
        } else { // Menu not active; get geocode 'search' results
          this._geocodeSearch(evt.target.value)
        }

        // Suppress default 'Enter' behavior which causes page to reload
        evt.preventDefault()
        break

      // Any other key pressed: clear active selection
      default:
        this.setState({ activeIndex: null })
    }
  }

  _setLocation (location) {
    if (typeof this.props.onLocationSelected === 'function') {
      this.props.onLocationSelected(location)
    }
    this.props.setLocation({
      type: this.props.type,
      location
    })
  }

  _useCurrentLocation = () => {
    const {currentPosition, getCurrentPosition, setLocationToCurrent, type} = this.props
    if (currentPosition.coords) {
      // We already have geolocation coordinates
      setLocationToCurrent({ type })
    } else {
      // Call geolocation.getCurrentPosition and set as from/to type
      this.setState({fetchingLocation: true})
      getCurrentPosition(type)
    }
  }

  /**
   * Provide alert to user with reason for geolocation error
   */
  _geolocationAlert = () => {
    window.alert(
      `Geolocation either has been disabled for ${window.location.host} or is not available in your browser.\n\nReason: ${this.props.currentPosition.error.message || 'Unknown reason'}`
    )
  }

  render () {
    const {
      currentPosition,
      label,
      showClearButton,
      static: isStatic,
      type
    } = this.props

    const { activeIndex } = this.state

    let geocodedFeatures = this.state.geocodedFeatures
    if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.slice(0, 5)

    let nearbyStops = this.props.nearbyStops
    if (nearbyStops.length > 4) nearbyStops = nearbyStops.slice(0, 3)

    let sessionSearches = this.props.sessionSearches
    if (sessionSearches.length > 5) sessionSearches = sessionSearches.slice(0, 5)

    // Assemble menu contents, to be displayed either as dropdown or static panel.
    // Menu items are created in four phases: (1) the current location, (2) any
    // geocoder search results; (3) nearby transit stops; and (4) saved searches

    let menuItems = [] // array of menu items for display (may include non-selectable items e.g. dividers/headings)
    let itemIndex = 0 // the index of the current location-associated menu item (excluding non-selectable items)
    this.locationSelectedLookup = {} // maps itemIndex to a location selection handler (for use by the _onKeyDown method)

    /* 1) Process the current location */
    let locationSelected, optionIcon, optionTitle

    if (!currentPosition.error) { // current position detected successfully
      locationSelected = this._useCurrentLocation
      optionIcon = 'location-arrow'
      optionTitle = 'Use Current Location'
    } else { // error detecting current position
      locationSelected = this._geolocationAlert
      optionIcon = 'ban'
      optionTitle = 'Current location not available'
    }

    // Add to the selection handler lookup (for use in _onKeyDown)
    this.locationSelectedLookup[itemIndex] = locationSelected

    // Create and add the option item to the menu items array
    const currentLocationOption = createOption(optionIcon, optionTitle, locationSelected, itemIndex === activeIndex)
    menuItems.push(currentLocationOption)
    itemIndex++

    /* 2) Process geocode search result option(s) */
    if (geocodedFeatures.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='sr-header'>Search Results</MenuItem>)

      // Iterate through the geocoder results
      menuItems = menuItems.concat(geocodedFeatures.map(feature => {
        // Create the selection handler
        const locationSelected = () => {
          // Construct the location
          const location = lonlat.fromCoordinates(feature.geometry.coordinates)
          location.name = feature.properties.label
          // Set the current location
          this._setLocation(location)
          // Add to the location search history
          this.props.addLocationSearch({ location })
        }

        // Add to the selection handler lookup (for use in _onKeyDown)
        this.locationSelectedLookup[itemIndex] = locationSelected

        // Create and return the option menu item
        const option = createOption('map-pin', feature.properties.label, locationSelected, itemIndex === activeIndex)
        itemIndex++
        return option
      }))
    }

    /* 3) Process nearby transit stop options */
    if (nearbyStops.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='ns-header'>Nearby Stops</MenuItem>)

      // Iterate through the found nearby stops
      menuItems = menuItems.concat(nearbyStops.map(stopId => {
        // Constuct the location
        const stop = this.props.stopsIndex[stopId]
        const location = {
          name: stop.name,
          lat: stop.lat,
          lon: stop.lon
        }

        // Create the location selected handler
        const locationSelected = () => { this._setLocation(location) }

        // Add to the selection handler lookup (for use in _onKeyDown)
        this.locationSelectedLookup[itemIndex] = locationSelected

        // Create and return the option menu item
        const option = createTransitStopOption(stop, locationSelected, itemIndex === activeIndex)
        itemIndex++
        return option
      }))
    }

    /* 4) Process recent search history options */
    if (sessionSearches.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='ss-header'>Recently Searched</MenuItem>)

      // Iterate through any saved locations
      menuItems = menuItems.concat(sessionSearches.map(location => {
        // Create the location-selected handler
        const locationSelected = () => { this._setLocation(location) }

        // Add to the selection handler lookup (for use in _onKeyDown)
        this.locationSelectedLookup[itemIndex] = locationSelected

        // Create and return the option menu item
        const option = createOption('search', location.name, locationSelected, itemIndex === activeIndex)
        itemIndex++
        return option
      }))
    }

    // Store the number of location-associated items for reference in the _onKeyDown method
    this.menuItemCount = itemIndex

    /** the text input element **/
    const placeholder = currentPosition.fetching === type
      ? 'Fetching location...'
      : label || type
    const textControl = <FormControl
      ref={ctl => { this.formControl = ctl }}
      className={this._getFormControlClassname()}
      type='text'
      value={this.state.value}
      placeholder={placeholder}
      onChange={this._onTextInputChange}
      onClick={this._onTextInputClick}
      onKeyDown={this._onKeyDown}
    />

    /** the clear ('X') button add-on */
    const clearButton = <InputGroup.Addon onClick={this._onClearButtonClick}>
      <i className='fa fa-times' />
    </InputGroup.Addon>

    if (isStatic) { // 'static' mode (menu is displayed alongside input)
      return (
        <div className='location-field static'>
          <form>
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon>
                  <i className={`fa fa-${type === 'from' ? 'star' : 'map-marker'}`} />
                </InputGroup.Addon>
                {textControl}
                {showClearButton && clearButton}
              </InputGroup>
            </FormGroup>
          </form>
          <ul className='dropdown-menu'>
            {menuItems}
          </ul>
        </div>
      )
    } else { // default display mode with dropdown menu
      return (
        <form>
          <FormGroup className='location-field'>
            <InputGroup>
              {/* location field icon -- also serves as dropdown anchor */}
              <DropdownButton
                componentClass={InputGroup.Button}
                open={this.state.menuVisible}
                onToggle={this._onDropdownToggle}
                id='location-dropdown'
                title={<i className={`fa fa-${type === 'from' ? 'star' : 'map-marker'}`} />}
                noCaret
              >
                {menuItems}
              </DropdownButton>
              {textControl}
              {showClearButton && clearButton}
            </InputGroup>
          </FormGroup>
        </form>
      )
    }
  }
}

// helper functions for dropdown options

let itemKey = 0

function createOption (icon, title, onSelect, isActive) {
  return <MenuItem className='location-option' onSelect={onSelect} key={itemKey++} active={isActive}>
    <div>
      <div style={{ float: 'left' }}><i className={`fa fa-${icon}`} /></div>
      <div style={{ marginLeft: '30px' }}>{title}</div>
    </div>
  </MenuItem>
}

function createTransitStopOption (stop, onSelect, isActive) {
  return <MenuItem className='location-option' onSelect={onSelect} key={itemKey++} active={isActive}>
    <div>
      <div style={{ float: 'left', paddingTop: '3px' }}>
        <i className='fa fa-bus' style={{ fontSize: '20px' }} />
        <div style={{ fontSize: '8px' }}>{distanceStringImperial(stop.dist, true)}</div>
      </div>
      <div style={{ marginLeft: '30px' }}>
        <div>{stop.name} ({stop.code})</div>
        <div style={{ fontSize: '9px' }}>
          {(stop.routes || []).map((route, i) => {
            const name = route.shortName || route.longName
            return (
              <span key={`route-${i}`} className='route'>
                {name}
              </span>
            )
          })}
        </div>
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  </MenuItem>
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    location: state.otp.currentQuery[ownProps.type],
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    stopsIndex: state.otp.transitIndex.stops
  }
}

const mapDispatchToProps = {
  addLocationSearch,
  findNearbyStops,
  getCurrentPosition,
  setLocation,
  setLocationToCurrent,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
