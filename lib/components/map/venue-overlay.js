import {
  getDateFormat,
  getTimeFormat
} from '@opentripplanner/core-utils/lib/time'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Marker, Popup, withLeaflet } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Button } from 'react-bootstrap'

import { setLocation } from '../../actions/map'
import { setQueryParam } from '../../actions/form'

const venueIcon = '<svg id="acab5c90-d3b6-4f36-9bf8-ad5799ccb3c8" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.61 113.39"><title>Venue</title><path d="M56.65,113.39c-1.3-2.26-2.52-4.34-3.72-6.44C43.8,91.06,34.73,75.13,25.5,59.3c-2.67-4.57-5.08-9.21-6-14.45-2.31-13.73,1.55-25.51,11.75-35C38.64,3,47.54-.14,57.57,0A37.79,37.79,0,0,1,93,27.16a37.36,37.36,0,0,1-4,30.29c-6.43,11-12.7,22-19,33q-6.33,11-12.64,22C57.1,112.69,56.94,112.93,56.65,113.39Z" transform="translate(-18.89)" fill="#e64c3c"/><path d="M56.74,6.07a31.45,31.45,0,0,1,31.81,31.6,31.51,31.51,0,0,1-31.88,32A31.53,31.53,0,0,1,24.79,37.86,31.47,31.47,0,0,1,56.74,6.07Z" transform="translate(-18.89)" fill="#c03a2c"/><path d="M77.26,32.13c.4-.66.73-1.26,1.13-1.82a3.26,3.26,0,0,1,.66-.56c.13.26.38.53.38.79A2.94,2.94,0,0,1,78,32.75a16.44,16.44,0,0,1-6.47,2.51,75.37,75.37,0,0,1-23.55,1A33.23,33.23,0,0,1,37.31,33.8,11.19,11.19,0,0,1,34.66,32,3.26,3.26,0,0,1,34,30.4c0-.17.27-.43.42-.65a2.64,2.64,0,0,1,.59.51c.4.59.76,1.22,1.21,2,1.62-1.45,3.14-2.62,4.43-4a8.81,8.81,0,0,1,5.95-2.62,89.34,89.34,0,0,1,21.74.21,6.33,6.33,0,0,1,3.86,1.72C73.74,29.09,75.44,30.5,77.26,32.13ZM42.58,34.38c.89-1.62,1.76-3.13,2.53-4.68a1.51,1.51,0,0,1,1.6-.93q10,0,20,0a1.43,1.43,0,0,1,1.53.89c.76,1.55,1.63,3.06,2.5,4.67L75,33.1C73.47,31.49,72,30,70.53,28.39a3.26,3.26,0,0,0-2.06-1,82.26,82.26,0,0,0-22.71-.1,3.88,3.88,0,0,0-2,.49c-1.81,1.7-3.49,3.54-5.28,5.39Z" transform="translate(-18.89)" fill="#fff"/><path d="M56.72,22.5c5.66.06,11.32.22,16.75,2.11a24.43,24.43,0,0,1,3.1,1.48c.18.1.22.47.32.71-.28,0-.65.23-.84.11-3-1.86-6.37-2.4-9.76-2.85a76.67,76.67,0,0,0-17.72-.19A31,31,0,0,0,39.08,26c-.57.24-1.08.63-1.65.87a2.06,2.06,0,0,1-.86,0c.09-.27.1-.7.29-.81A21.91,21.91,0,0,1,40,24.59,47.06,47.06,0,0,1,54.05,22.5C54.94,22.47,55.83,22.5,56.72,22.5Z" transform="translate(-18.89)" fill="#fff"/><path d="M85.22,36.07a17.5,17.5,0,0,0-2-7.65c-2.1-3.78-5.54-5.74-9.54-7a47.45,47.45,0,0,0-11-1.76V18h4.88l0-.16-5.79-3v4.83c-1.67-.08-3.35-.12-5-.16H56.2V17.4H61v-.18l-5.68-3v5.28c-2.53.06-5,.16-7.55.42l.87-.12V18h4.85l0-.18-5.66-2.95c0,.49,0,.8,0,1.11,0,1.09,0,2.18,0,3.27,0,.44-.11.64-.48.74a44.76,44.76,0,0,0-7.64,1.46c-6.13,1.79-10.24,5.54-11.19,12-.5,3.39-.41,6.88-.62,10.32a6,6,0,0,0,3,5.69c4,2.6,8.58,3.62,13.2,4.34a81.92,81.92,0,0,0,25,0,37.65,37.65,0,0,0,12-3.6c2.24-1.19,4.21-2.77,4.26-5.59S85.37,38.93,85.22,36.07ZM82.55,46.82l-.39-.13V43.75c0-.73-.32-1-1-.63-1,.46-1.69,1.06-1.48,2.32.1.65-.06,1.33,0,2,.16,1.14-.41,1.6-1.52,1.79,0-1.09,0-2.16,0-3.23s-.25-1.14-1.13-.85c-2.82.92-2.3.47-2.35,3.1,0,.3,0,.6,0,.89,0,1.47,0,1.47-1.7,1.73,0-1.13,0-2.23,0-3.33,0-.86-.33-1.13-1.13-1s-1.62.31-2.43.45a.94.94,0,0,0-.87,1.09c0,1.21,0,2.41,0,3.66l-1.84.32c0-1.25,0-2.43,0-3.61,0-.72-.28-1-1-1-1.15.11-2.29.19-3.44.26-.7,0-1,.38-1,1.08,0,1.18,0,2.36,0,3.61l-1.57.17v-3.2c0-1.51,0-1.51-1.56-1.5-1.12,0-2.24,0-3.35,0-.85,0-1.21.23-1.17,1.12,0,1.17,0,2.35,0,3.59l-1.63-.15c0-1.19,0-2.36,0-3.53,0-.87-.32-1.17-1.13-1.2s-1.84-.15-2.76-.21c-1.43-.09-1.46-.05-1.46,1.34,0,1,0,2,0,3.16l-1.87-.28c0-1.24,0-2.42,0-3.59a1,1,0,0,0-1-1.19c-.75-.11-1.49-.25-2.23-.41s-1.24,0-1.19,1,0,2.16,0,3.38l-1.74-.45c0-1.21,0-2.4,0-3.58a1.14,1.14,0,0,0-1-1.33,10.92,10.92,0,0,1-1.4-.46c-.82-.33-1.1,0-1.09.8,0,1.08,0,2.16,0,3.26-1.52-.31-1.57-.36-1.57-1.76a11.76,11.76,0,0,1,0-2,2,2,0,0,0-1.39-2.28c-.71-.33-1.07-.16-1.1.63,0,1,0,1.95,0,3.11a2.7,2.7,0,0,1-1.14-2.34c.15-3.52.17-7,.58-10.53A11.4,11.4,0,0,1,38,24.38a34.8,34.8,0,0,1,11.42-2.45,77.46,77.46,0,0,1,20.06.73,30.83,30.83,0,0,1,6.13,1.8,11,11,0,0,1,7.11,9.24c.43,3.67.49,7.4.61,11.11A6,6,0,0,1,82.55,46.82Z" transform="translate(-18.89)" fill="#fff"/></svg>'

class VenueOverlay extends MapLayer {
  static propTypes = {
    setLocation: PropTypes.func,
    setQueryParam: PropTypes.func
  }

  _setLocation = (venue) => {
    this.props.setLocation({
      locationType: "to",
      location: {
        lat: venue.location.lat,
        lon: venue.location.lng,
        name: venue.name
      },
      reverseGeocode: false
    });
  }

  _setArriveBy = (time) => {
    const {setQueryParam} = this.props
    setQueryParam({ departArrive: 'ARRIVE' })
    setQueryParam({ time })
  }

  _handleEventSelection = (venue, arrivalTime) => {
    this._setLocation(venue);
    this._setArriveBy(arrivalTime);
  }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }
  componentDidMount () { }

  createLeafletElement () {
  }

  updateLeafletElement () {
  }

  render () {
    const { currentPosition } = this.props

    const markerIcon = divIcon({
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -12],
      html: venueIcon,
      className: ''
    })

    return (
      <FeatureGroup>
        {this.props.venues.map((venue) => {
          return (
            <Marker
              icon={markerIcon}
              key={venue.name}
              position={[venue.location.lat, venue.location.lng]}
            >
              <Popup>
                <div className='map-overlay-popup'>
                  {/* Popup title */}
                  <div className='popup-title'>
                    {venue.name}
                  </div>

                  <div className='popup-row'>
                    <div className='event-list'>
                      <strong>Destination Event</strong>
                      {venue.events.map((event, index) =>
                        <VenueEventButton
                          key={"venue" + index}
                          selectEvent={this._handleEventSelection}
                          map={this.props.leaflet.map}
                          venue={venue}
                          name={event.name}
                          time={event.time}
                          arrivalTime={event.arrivalTime} />
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </FeatureGroup>
    )
  }
}

class VenueEventButton extends Component {
  _onClick = (venue, arrivalTime) => {
    this.props.selectEvent(venue, arrivalTime);
    this.props.map.closePopup();
  }

  render () {
    const { name, time, arrivalTime, venue } = this.props;
    return <div style={{marginTop: 0.5 + 'rem'}}><Button className='' onClick={() => this._onClick(venue, arrivalTime)}>{name} - {time}</Button></div>
  }
}


const mapStateToProps = (state, ownProps) => {
  const { departArrive, date, time, startTime, endTime } = state.otp.currentQuery

  return {
    venues: [{
      "name": "ALEXANDER STADIUM",
      "events": [{
        "name": "ATHLETICS",
        "time": "10:00",
        "arrivalTime": "09:00"
      }],
      "location": {
        "lat": "52.530916",
        "lng": "-1.904674",
        "address": "ALEXANDER STADIUM, Walsall Rd, Birmingham, Perry Barr, B42 2LR"
      }
    },{
      "name": "ARENA BIRMINGHAM",
      "events": [{
        "name": "GYMNASTICS",
        "time": "10:00",
        "arrivalTime": "09:00"
      }],
      "location": {
        "lat": "52.479757",
        "lng": "-1.914926",
        "address": "ARENA BIRMINGHAM, King Edwards Rd, Birmingham B1 2AA"
      }
    }, {
      "name": "BIRMINGHAM CITY CENTRE",
      "events": [{
        "name": "BASKETBALL",
        "time": "11:00",
        "arrivalTime": "10:00"
      }],
      "location": {
        "lat": "52.476388",
        "lng": "-1.912659",
        "address": "BIRMINGHAM CITY CENTRE, Broad St, Birmingham B1 2EP"
      }
    }, {
      "name": "CANNOCK CHASE",
      "events": [{
        "name": "CYCLING",
        "time": "11:30",
        "arrivalTime": "10:30"
      }],
      "location": {
        "lat": "52.750790",
        "lng": "-1.975704",
        "address": "CANNOCK CHASE, Birches Valley, Rugeley WS15 2UQ"
      }
    }, {
      "name": "COVENTRY STADIUM",
      "events": [{
        "name": "RUGBY SEVENS",
        "time": "12:50",
        "arrivalTime": "11:50"
      }, {
        "name": "JUDO",
        "time": "15:20",
        "arrivalTime": "14:20"
      }, {
        "name": "WRESTLING",
        "time": "16:00",
        "arrivalTime": "15:00"
      }],
      "location": {
        "lat": "52.448438",
        "lng": "-1.496844",
        "address": "COVENTRY STADIUM, Judds Ln, Coventry CV6 6GE"
      }
    }, {
      "name": "EDGBASTON STADIUM",
      "events": [{
        "name": "WOMEN'S CRICKET",
        "time": "09:30",
        "arrivalTime": "08:30"
      }],
      "location": {
        "lat": "52.455316",
        "lng": "-1.903790",
        "address": "EDGBASTON STADIUM, Edgbaston Road, Birmingham, B5 7QU"
      }
    }, {
      "name": "LEE VALLEY VELOPARK",
      "events": [{
        "name": "CYCLING",
        "time": "09:00",
        "arrivalTime": "08:00"
      }],
      "location": {
        "lat": "51.550400",
        "lng": "-0.015384",
        "address": "LEE VALLEY VELOPARK, Queen Elizabeth Olympic Park, Abercrombie Rd, London E20 3AB"
      }
    }, {
      "name": "NEC",
      "events": [{
        "name": "BADMINTON",
        "time": "11:30",
        "arrivalTime": "10:30"
      }, {
        "name": "BOXING",
        "time": "14:00",
        "arrivalTime": "13:00"
      }, {
        "name": "TABLE TENNIS",
        "time": "13:00",
        "arrivalTime": "12:00"
      }, {
        "name": "NETBALL",
        "time": "13:30",
        "arrivalTime": "12:30"
      }, {
        "name": "WEIGHTLIFTING",
        "time": "17:00",
        "arrivalTime": "16:00"
      }],
      "location": {
        "lat": "52.454383",
        "lng": "-1.716852",
        "address": "NEC, North Ave, Marston Green, Birmingham B40 1NT"
      }
    }, {
      "name": "SANDWELL AQUATICS CENTRE",
      "events": [{
        "name": "AQUATICS",
        "time": "08:00",
        "arrivalTime": "07:00"
      }],
      "location": {
        "lat": "52.489173",
        "lng": "-1.989492",
        "address": "SANDWELL AQUATICS CENTRE, Smethwick B67 7HE"
      }
    }, {
      "name": "SUTTON PARK",
      "events": [{
        "name": "TRIATHLON",
        "time": "15:00",
        "arrivalTime": "14:00"
      }],
      "location": {
        "lat": "52.572415",
        "lng": "-1.840374",
        "address": "SUTTON PARK, Thornhill Rd, Royal Sutton Coldfield B74 3EW"
      }
    }, {
      "name": "UNIVERSITY OF BIRMINGHAM",
      "events": [{
        "name": "HOCKEY",
        "time": "12:30",
        "arrivalTime": "11:30"
      }, {
        "name": "SQUASH",
        "time": "13:00",
        "arrivalTime": "12:00"
      }],
      "location": {
        "lat": "52.451303",
        "lng": "-1.932234",
        "address": "UNIVERSITY OF BIRMINGHAM, Edgbaston, Birmingham, B15 2TT"
      }
    }, {
      "name": "VICTORIA PARK, ROYAL LEAMINGTON SPA",
      "events": [{
        "name": "LAWN BOWLS",
        "time": "12:00",
        "arrivalTime": "11:00"
      }],
      "location": {
        "lat": "52.287472",
        "lng": "-1.542131",
        "address": "VICTORIA PARK, ROYAL LEAMINGTON SPA, Park Drive, Royal Leamington Spa CV31 3PH"
      }
    }],
    config: state.otp.config,
    departArrive,
    date,
    time,
    startTime,
    endTime,
    timeFormat: getTimeFormat(state.otp.config),
    dateFormat: getDateFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  setLocation,
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(VenueOverlay))
