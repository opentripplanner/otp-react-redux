import lonlat from '@conveyal/lonlat'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
  FormGroup,
  FormControl,
  InputGroup,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { autocomplete, search } from 'isomorphic-mapzen-search'
import { throttle } from 'throttle-debounce'

import LocationIcon from '../icons/location-icon'
import { setLocation, setLocationToCurrent, clearLocation } from '../../actions/map'
import { addLocationSearch, getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
import { distanceStringImperial } from '../../util/distance'
import { formatStoredPlaceName } from '../../util/map'

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
      value: props.location && !props.hideExistingValue
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

  _geocodeAutocomplete = throttle(1000, (text) => {
    const { MAPZEN_KEY, baseUrl, boundary, focusPoint } = this.props.config.geocoder
    if (!text) {
      console.warn('No text entry provided for geocode autocomplete search.')
      return
    }
    autocomplete({
      apiKey: MAPZEN_KEY,
      boundary,
      focusPoint,
      sources: null,
      text,
      url: baseUrl ? `${baseUrl}/autocomplete` : null
    }).then((result) => {
      this.setState({ geocodedFeatures: result.features })
    }).catch((err) => {
      console.error(err)
    })
  })

  _geocodeSearch (text) {
    const { MAPZEN_KEY, baseUrl, boundary, focusPoint } = this.props.config.geocoder
    if (!text) {
      console.warn('No text entry provided for geocode search.')
      return
    }
    search({
      apiKey: MAPZEN_KEY,
      boundary,
      focusPoint,
      text,
      sources: null,
      url: baseUrl ? `${baseUrl}/search` : null,
      format: false // keep as returned GeoJSON
    }).then((result) => {
      console.log(`search results (query=${text})`, result)
      if (result.features && result.features.length > 0) {
        // Only replace geocode items if results were found
        this.setState({ geocodedFeatures: result.features })
      } else {
        console.warn('No results found for geocode search. Not replacing results.')
      }
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
    this._onTextInputClick()
  }

  _onDropdownToggle = (v, e) => {
    // if clicked on input form control, keep dropdown open; otherwise, toggle
    const targetIsInput =
      e.target.className.indexOf(this._getFormControlClassname()) !== -1
    const menuVisible = targetIsInput ? true : !this.state.menuVisible
    this.setState({ menuVisible })
  }
  /**
   * Only hide menu if the target clicked is not a menu item in the dropdown.
   * Otherwise, the click will not "finish" and the menu will hide without the
   * user having made a selection.
   */
  _onBlurFormGroup = (e) => {
    // IE does not use relatedTarget, so this check handles cross-browser support.
    // see https://stackoverflow.com/a/49325196/915811
    const target = e.relatedTarget !== null ? e.relatedTarget : document.activeElement
    if (!this.props.location && (!target || target.getAttribute('role') !== 'menuitem')) {
      this.setState({ menuVisible: false, value: '', geocodedFeatures: [] })
    }
  }

  _onTextInputChange = (evt) => {
    this.setState({ value: evt.target.value, menuVisible: true })
    this._geocodeAutocomplete(evt.target.value)
  }

  _onTextInputClick = () => {
    const { config, currentPosition, nearbyStops, onClick } = this.props
    if (typeof onClick === 'function') onClick()
    this.setState({ menuVisible: true })
    if (nearbyStops.length === 0 && currentPosition && currentPosition.coords) {
      this.props.findNearbyStops({
        lat: currentPosition.coords.latitude,
        lon: currentPosition.coords.longitude,
        max: config.geocoder.maxNearbyStops || 4
      })
    }
  }

  _onKeyDown = (evt) => {
    const { activeIndex, menuVisible } = this.state
    switch (evt.key) {
      // 'Down' arrow key pressed: move selected menu item down by one position
      case 'ArrowDown':
        // Suppress default 'ArrowDown' behavior which moves cursor to end
        evt.preventDefault()
        if (!menuVisible) {
          // If the menu is not visible, simulate a text input click to show it.
          return this._onTextInputClick()
        }
        if (activeIndex === this.menuItemCount - 1) {
          return this.setState({ activeIndex: null })
        }
        return this.setState({
          activeIndex: activeIndex === null
            ? 0
            : activeIndex + 1
        })

      // 'Up' arrow key pressed: move selection up by one position
      case 'ArrowUp':
        // Suppress default 'ArrowUp' behavior which moves cursor to beginning
        evt.preventDefault()
        if (activeIndex === 0) {
          return this.setState({ activeIndex: null })
        }
        return this.setState({
          activeIndex: activeIndex === null
            ? this.menuItemCount - 1
            : activeIndex - 1
        })

      // 'Enter' keypress serves two purposes:
      //  - If pressed when typing in search string, switch from 'autocomplete'
      //    to 'search' geocoding
      //  - If pressed when dropdown results menu is active, apply the location
      //    associated with current selected menu item
      case 'Enter':
        if (typeof activeIndex === 'number') { // Menu is active
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
          // Ensure menu is visible.
          this.setState({ menuVisible: true })
        }

        // Suppress default 'Enter' behavior which causes page to reload
        evt.preventDefault()
        break
      case 'Escape':
        // Clear selection & hide the menu
        return this.setState({
          menuVisible: false,
          activeIndex: null
        })
      // Any other key pressed: clear active selection
      default:
        return this.setState({ activeIndex: null })
    }
  }

  _setLocation (location) {
    const { onLocationSelected, setLocation, type } = this.props
    onLocationSelected && onLocationSelected()
    setLocation({ type, location })
  }

  _useCurrentLocation = () => {
    const {
      currentPosition,
      getCurrentPosition,
      onLocationSelected,
      setLocationToCurrent,
      type
    } = this.props
    if (currentPosition.coords) {
      // We already have geolocation coordinates
      setLocationToCurrent({ type })
      onLocationSelected && onLocationSelected()
    } else {
      // Call geolocation.getCurrentPosition and set as from/to type
      this.setState({ fetchingLocation: true })
      getCurrentPosition(type, onLocationSelected)
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
      location,
      user,
      showClearButton,
      static: isStatic,
      suppressNearby,
      type,
      nearbyStops
    } = this.props
    const locations = [...user.locations, ...user.recentPlaces]
    const { activeIndex } = this.state
    let geocodedFeatures = this.state.geocodedFeatures
    if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.slice(0, 5)

    let sessionSearches = this.props.sessionSearches
    if (sessionSearches.length > 5) sessionSearches = sessionSearches.slice(0, 5)

    // Assemble menu contents, to be displayed either as dropdown or static panel.
    // Menu items are created in four phases: (1) the current location, (2) any
    // geocoder search results; (3) nearby transit stops; and (4) saved searches

    let menuItems = [] // array of menu items for display (may include non-selectable items e.g. dividers/headings)
    let itemIndex = 0 // the index of the current location-associated menu item (excluding non-selectable items)
    this.locationSelectedLookup = {} // maps itemIndex to a location selection handler (for use by the _onKeyDown method)

    /* 1) Process geocode search result option(s) */
    if (geocodedFeatures.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      // menuItems.push(<MenuItem header key='sr-header'>Search Results</MenuItem>)

      // Iterate through the geocoder results
      menuItems = menuItems.concat(geocodedFeatures.map((feature, i) => {
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
        const option = createOption('map-pin', feature.properties.label, locationSelected, itemIndex === activeIndex, i === geocodedFeatures.length - 1)
        itemIndex++
        return option
      }))
    }

    /* 2) Process nearby transit stop options */
    if (nearbyStops.length > 0 && !suppressNearby) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='ns-header'>Nearby Stops</MenuItem>)

      // Iterate through the found nearby stops
      menuItems = menuItems.concat(nearbyStops.map((stopId, i) => {
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
        const option = createTransitStopOption(stop, locationSelected, itemIndex === activeIndex, i === nearbyStops.length - 1)
        itemIndex++
        return option
      }))
    }

    /* 3) Process recent search history options */
    if (sessionSearches.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='ss-header'>Recently Searched</MenuItem>)

      // Iterate through any saved locations
      menuItems = menuItems.concat(sessionSearches.map((location, i) => {
        // Create the location-selected handler
        const locationSelected = () => { this._setLocation(location) }

        // Add to the selection handler lookup (for use in _onKeyDown)
        this.locationSelectedLookup[itemIndex] = locationSelected

        // Create and return the option menu item
        const option = createOption('search', location.name, locationSelected, itemIndex === activeIndex, i === sessionSearches.length - 1)
        itemIndex++
        return option
      }))
    }

    /* 3b) Process stored user locations */
    if (locations.length > 0) {
      // Add the menu sub-heading (not a selectable item)
      menuItems.push(<MenuItem header key='ss-header'>My Places</MenuItem>)

      // Iterate through any saved locations
      menuItems = menuItems.concat(locations.map((location, i) => {
        // Create the location-selected handler
        const locationSelected = () => { this._setLocation(location) }

        // Add to the selection handler lookup (for use in _onKeyDown)
        this.locationSelectedLookup[itemIndex] = locationSelected

        // Create and return the option menu item
        const option = createOption(
          location.icon,
          formatStoredPlaceName(location),
          locationSelected,
          itemIndex === activeIndex,
          i === sessionSearches.length - 1
        )
        itemIndex++
        return option
      }))
    }

    /* 4) Process the current location */
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

    if (!suppressNearby) {
      // Create and add the option item to the menu items array
      const currentLocationOption = createOption(
        optionIcon,
        optionTitle,
        locationSelected,
        itemIndex === activeIndex
      )
      menuItems.push(currentLocationOption)
      itemIndex++
    }

    // Store the number of location-associated items for reference in the _onKeyDown method
    this.menuItemCount = itemIndex

    /** the text input element **/
    const placeholder = currentPosition.fetching === type
      ? 'Fetching location...'
      : label || type
    const textControl = <FormControl
      autoFocus={isStatic} // focuses the input when the component mounts if static
      ref={ctl => { this.formControl = ctl }}
      className={this._getFormControlClassname()}
      type='text'
      value={this.state.value}
      placeholder={placeholder}
      onChange={this._onTextInputChange}
      onClick={this._onTextInputClick}
      onKeyDown={this._onKeyDown}
    />

    // Only include the clear ('X') button add-on if a location is selected
    // or if the input field has text.
    const clearButton = showClearButton && location
      ? <InputGroup.Addon>
        <Button
          bsStyle='link'
          className='clear-button'
          onClick={this._onClearButtonClick}>
          <i className='fa fa-times' />
        </Button>
      </InputGroup.Addon>
      : null
    if (isStatic) {
      // 'static' mode (menu is displayed alongside input, e.g., for mobile view)
      return (
        <div
          className='location-field static'>
          <form>
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon>
                  <LocationIcon type={type} />
                </InputGroup.Addon>
                {textControl}
                {clearButton}
              </InputGroup>
            </FormGroup>
          </form>
          <ul className='dropdown-menu' style={{ width: '100%' }}>
            {menuItems.length > 0 // Show typing prompt to avoid empty screen
              ? menuItems
              : <MenuItem header className={'text-center'}>
                Begin typing to search for locations
              </MenuItem>
            }
          </ul>
        </div>
      )
    } else {
      // default display mode with dropdown menu
      return (
        <form>
          <FormGroup
            onBlur={this._onBlurFormGroup}
            className='location-field'>
            <InputGroup>
              {/* location field icon -- also serves as dropdown anchor */}
              <DropdownButton
                componentClass={InputGroup.Button}
                open={this.state.menuVisible}
                onToggle={this._onDropdownToggle}
                id='location-dropdown'
                title={<LocationIcon type={type} />}
                noCaret
              >
                {menuItems}
              </DropdownButton>
              {textControl}
              {clearButton}
            </InputGroup>
          </FormGroup>
        </form>
      )
    }
  }
}

// helper functions for dropdown options

let itemKey = 0

function createOption (icon, title, onSelect, isActive, isLast) {
  return <MenuItem className={`location-option${isLast ? ' last-option' : ''}`} onSelect={onSelect} key={itemKey++} active={isActive}>
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
    user: state.otp.user,
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
