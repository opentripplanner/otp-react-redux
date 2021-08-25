import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import Icon from '../narrative/icon'
import { extractHeadsignFromPattern, getColorAndNameFromRoute } from '../../util/viewer'
import { findStopsForPattern } from '../../actions/api'
import { setMainPanelContent, setViewedStop, setViewedRoute } from '../../actions/ui'

/** Converts text color (either black or white) to rgb */
const textHexToRgb = (color) => (color === '#ffffff' ? '255,255,255' : '0,0,0')

const Container = styled.div`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  overflow-y: hidden;
  height: 100%;
`
const RouteNameContainer = styled.div`
  padding: 8px;
  color: ${props => props.textColor};
`
const LogoLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const MoreDetailsLink = styled.a`
    color: ${(props) => props.color};
    background-color: rgba(${(props) => textHexToRgb(props.color)},0.1);
    padding: 5px;
    display: block;
    border-radius: 5px;
    transition: 0.1s all ease-in-out;

    &:hover {
        background-color: rgba(255,255,255,0.8);
        color: #333;
    }
}
`
const PatternContainer = styled.div`
  background-color: ${(props) => props.routeColor};
  color: ${(props) => props.textColor};
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  gap: 16px;
  padding: 0 8px;
  margin: 0;

  overflow-x: scroll;

  h4 {
      margin-bottom: 0px;
      white-space: nowrap;
  }

  button {
      color: inherit;
      border-bottom: 3px solid ${(props) => props.textColor};
  }

  button:hover, button:focus, button:visited {
    text-decoration: none;
  }
  button:hover,  button:focus, button.active {
      color: ${(props) => props.color};
      background-color: ${(props) => props.textColor};
  }
}
`

const StopContainer = styled.div`
  color: #333;
  background-color: #fff;
  overflow-y: scroll;
  height: 100%;
  /* 150px bottom padding is needed to ensure all stops 
  are shown when browsers don't calculate 100% sensibly */
  padding: 15px 0 100px;
`
const Stop = styled.a`
  cursor: pointer;
  color: #333;
  display: block;
  margin-left: 45px;
  /* negative margin accounts for the height of the stop blob */
  margin-top: -25px;

  &:hover {
    color: #23527c;
  }

  /* this is the station blob */
  &::before {
    content: '';
    display: block;
    height: 20px;
    width: 20px;
    border: 5px solid ${props => props.routeColor};
    background: #fff;
    position: relative;
    top: 20px;
    left: -35px;
    border-radius: 20px;
  }

  /* this is the line between the blobs */
  &::after {
    content: '';
    display: block;
    height: 20px;
    width: 10px;
    background: ${props => props.routeColor};
    position: relative;
    left: -30px;
    /* this is 2px into the blob (to make it look attached) + 30px so that each
    stop's bar connects the previous bar with the current one */
    top: -37px;
  }
`

class RouteDetails extends Component {
  static propTypes = {
    // TODO: proptypes
    findStopsForPattern: findStopsForPattern.type,
    pattern: PropTypes.shape({id: PropTypes.string}),
    route: PropTypes.shape({ id: PropTypes.string }),
    setViewedRoute: setViewedRoute.type
  };

  componentDidMount = () => {
    this.getStops()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.pattern?.id !== this.props.pattern?.id) {
      this.getStops()
    }
  }

  /**
   * Requests stop list for current pattern
   */
  getStops = () => {
    const { findStopsForPattern, pattern, route } = this.props
    if (pattern && route) {
      findStopsForPattern({ patternId: pattern.id, routeId: route.id })
    }
  }

  _headSignButtonClicked = (id) => {
    const { route, setViewedRoute } = this.props
    setViewedRoute({ patternId: id, routeId: route.id })
  }

  _stopLinkClicked = (stopId) => {
    const { setMainPanelContent, setViewedStop } = this.props
    setMainPanelContent(null)
    setViewedStop({ stopId })
  }

  render () {
    const { className, operator, pattern, route } = this.props
    const { agency, patterns, url } = route

    const { backgroundColor: routeColor, color: textColor } = getColorAndNameFromRoute(
      operator,
      route
    )

    const headsigns =
      patterns &&
      Object.entries(patterns)
        .map((pattern) => {
          return {
            headsign: extractHeadsignFromPattern(pattern[1]),
            id: pattern[0]
          }
        })
        // Remove duplicate headsigns. Using a reducer means that the first pattern
        // with a specific headsign is the accepted one. TODO: is this good behavior?
        .reduce((prev, cur) => {
          const amended = prev
          if (!prev.find(h => h.headsign === cur.headsign)) {
            amended.push(cur)
          }
          return amended
        }, [])

    return (
      <Container
        backgroundColor={routeColor}
        textColor={textColor}
      >
        <RouteNameContainer className={className} textColor={textColor}>
          <LogoLinkContainer backgroundColor={routeColor}>
            {agency && <span>Run by {agency.name}</span>}
            {url && (
              <span>
                <MoreDetailsLink color={textColor} href={url} target='_blank'>
                  <Icon type='link' />
                  More details
                </MoreDetailsLink>
              </span>
            )}
          </LogoLinkContainer>
        </RouteNameContainer>
        <PatternContainer color={routeColor} textColor={textColor}>
          <h4>Stops To</h4>
          {headsigns &&
            headsigns.map((h) => (
              <Button
                bsStyle='link'
                className={h.id === pattern?.id ? 'active' : ''}
                key={h.id}
                onClick={() => this._headSignButtonClicked(h.id)}
              >
                {h.headsign}
              </Button>
            ))}
        </PatternContainer>
        {pattern && (
          <StopContainer routeColor={routeColor}>
            {pattern?.stops?.map((stop) => (
              <Stop key={stop.id} onClick={() => this._stopLinkClicked(stop.id)} routeColor={routeColor}>
                {stop.name}
              </Stop>
            ))}
          </StopContainer>
        )}
      </Container>
    )
  }
}

// connect to redux store
const mapStateToProps = (state, ownProps) => {
  return {
    viewedRoute: state.otp.ui.viewedRoute
  }
}

const mapDispatchToProps = {
  findStopsForPattern,
  setMainPanelContent,
  setViewedRoute,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteDetails)
