import lonlat from '@conveyal/lonlat'
import React, { Component, PropTypes } from 'react'
import { FormGroup, FormControl, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { autocomplete } from 'isomorphic-mapzen-search'

import { setLocation, clearLocation } from '../../actions/map'
import { addLocationSearch } from '../../actions/location'

class LocationField extends Component {
  static propTypes = {
    config: PropTypes.object,
    currentPosition: PropTypes.object,
    location: PropTypes.object,
    label: PropTypes.string,
    type: PropTypes.string, // replace with locationType?

    // dispatch
    addLocationSearch: PropTypes.func,
    clearLocation: PropTypes.func,
    setLocation: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      dropdownOpen: false,
      geocodedFeatures: []
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

  /* _onChange = (value, option) => {
    console.log(value, option)
    if (value && value.geometry) {
      const location = lonlat.fromCoordinates(value.geometry.coordinates)
      location.name = value.properties.label
      this.props.setLocation(this.props.type, location)
    } else if (value.feature) {
      // TODO: remove temp fix required for handling r-s-g geolocated option
      const location = lonlat.fromCoordinates(value.feature.geometry.coordinates)
      location.name = value.feature.properties.label
      this.props.setLocation(this.props.type, location)
    } else {
      this.props.clearLocation(this.props.type)
    }
  }

  _toValue = (location) => {
    return location && {
      value: `${location.lon},${location.lat}`,
      label: location.name
    }
  } */

  _geocode (text) {
    const { config } = this.props
    autocomplete({
      apiKey: config.geocoder.MAPZEN_KEY,
      boundary: config.geocoder.boundary,
      // TODO: use current location as focus point
      text
    }).then((result) => {
      console.log(result)
      this.setState({ geocodedFeatures: result.features })
    }).catch((err) => {
      console.error(err)
    })
  }

  render () {
    const { currentPosition } = this.props

    const currentLocationOption = currentPosition !== null
      ? createOption('location-arrow', 'Use Current Location', () => {
        this.props.setLocation(this.props.type, {
          lat: currentPosition.coords.latitude,
          lon: currentPosition.coords.longitude,
          name: '(Current Location)'
        })
      })
      : null

    let geocodedFeatures = this.state.geocodedFeatures
    if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.splice(0, 5)

    const nearbyStops = [] /* {
      name: 'Stop X',
      routes: ['10','11']
    }] */

    let recentSearches = this.props.sessionSearches
    if (recentSearches.length > 5) recentSearches = recentSearches.splice(0, 5)

    const formControlClassname = this.props.type + '-form-control'
    return (
      <form>
        <FormGroup className='location-field'>

          <InputGroup>
            {/* location field icon -- also serves as dropdown anchor */}
            <DropdownButton
              componentClass={InputGroup.Button}
              open={this.state.dropdownOpen}
              onToggle={(v, e) => {
                // if clicked on input form control, keep dropdown open; otherwise, toggle
                const targetIsInput = e.target.className.indexOf(formControlClassname) !== -1
                this.setState({ dropdownOpen: targetIsInput ? true : !this.state.dropdownOpen })
              }}
              id='location-dropdown'
              title={<i className='fa fa-star' />}
              noCaret
            >
              {/* current location option */}
              {currentLocationOption}

              {/* geocode search result option(s) */}
              {geocodedFeatures.length > 0 && <MenuItem header>Search Results</MenuItem>}
              {geocodedFeatures.length > 0 &&
                geocodedFeatures.map(feature => {
                  return createOption('map-pin', feature.properties.label, () => {
                    const location = lonlat.fromCoordinates(feature.geometry.coordinates)
                    location.name = feature.properties.label

                    // set the current location
                    this.props.setLocation(this.props.type, location)

                    // add to the location search history
                    this.props.addLocationSearch(location)
                  })
                })
              }

              {/* nearby transit stop options */}
              {nearbyStops.length > 0 && <MenuItem header>Nearby Stops</MenuItem>}
              {nearbyStops.length > 0 &&
                nearbyStops.map(stop => {
                  return createTransitStopOption(stop.name, stop.routes, () => {
                    // set location from stop
                  })
                })
              }

              {/* recent search history options */}
              {recentSearches.length > 0 && <MenuItem header>Recently Searched</MenuItem>}
              {recentSearches.length > 0 &&
                recentSearches.map(location => {
                  return createOption('search', location.name, () => {
                    // set the current location
                    this.props.setLocation(this.props.type, location)
                  })
                })
              }

            </DropdownButton>
            <FormControl ref='formControl'
              className={formControlClassname}
              type='text'
              value={this.state.value}
              placeholder={this.props.label || this.props.type}
              onChange={(e) => {
                this.setState({ value: e.target.value })
                this._geocode(e.target.value)
              }}
              onClick={() => {
                this.setState({ dropdownOpen: true })
              }}
            />
            <InputGroup.Addon onClick={() => {
              this.props.clearLocation(this.props.type)
              this.setState({
                value: '',
                geocodedFeatures: []
              })
            }}>
              <i className='fa fa-times' />
            </InputGroup.Addon>
          </InputGroup>
        </FormGroup>
      </form>
    )
  }
}

// helper functions for dropdown options

function createOption (icon, title, onSelect) {
  return <MenuItem onSelect={onSelect}>
    <div>
      <div style={{ float: 'left' }}><i className={`fa fa-${icon}`} /></div>
      <div style={{ marginLeft: '30px' }}>{title}</div>
    </div>
  </MenuItem>
}

function createTransitStopOption (name, routes, onSelect) {
  return <MenuItem onSelect={onSelect}>
    <div>
      <div style={{ float: 'left', paddingTop: '3px' }}>
        <i className='fa fa-bus' style={{ fontSize: '20px' }} />
        <div style={{ fontSize: '8px' }}>0.2 mi</div>
      </div>
      <div style={{ marginLeft: '30px' }}>
        <div>{name}</div>
        <div style={{ fontSize: '9px' }}>
          {routes.map(route => {
            return <span style={{ backgroundColor: 'gray', color: 'white', lineHeight: '9px', padding: '0px 3px', marginRight: '5px' }}>{route}</span>
          })}
        </div>
      </div>
    </div>
  </MenuItem>
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    location: state.otp.currentQuery[ownProps.type],
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addLocationSearch: (location) => { dispatch(addLocationSearch({ location })) },
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) },
    clearLocation: (type) => { dispatch(clearLocation({ type })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
