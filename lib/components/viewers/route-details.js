import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import tinycolor from 'tinycolor2'
import { connect } from 'react-redux'

import Icon from '../narrative/icon'
import { extractHeadsignFromPattern, getColorAndNameFromRoute } from '../../util/viewer'
import { setViewedRoute } from '../../actions/ui'

/** Converts text color (either black or white) to rgb */
const textHexToRgb = (color) => (color === '#ffffff' ? '255,255,255' : '0,0,0')

const Wrapper = styled.div`
  padding: 8px;
  color: ${props => props.textColor}
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
  background-color: ${(props) =>
    tinycolor(props.color).isDark()
      ? tinycolor(props.color).lighten(5).toHexString()
      : tinycolor(props.color).darken(5).toHexString()};
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
  color: pink;
  background-color: #fff;
`

class RouteDetails extends Component {
  static propTypes = {
    // TODO: proptypes
    pattern: PropTypes.shape({id: PropTypes.string}),
    route: PropTypes.shape({ id: PropTypes.string }),
    setViewedRoute: setViewedRoute.type
  };

  _headSignButtonClicked = (id) => {
    const { route, setViewedRoute } = this.props
    setViewedRoute({ patternId: id, routeId: route.id })
  }

  render () {
    const { className, operator, pattern, route } = this.props
    const { agency, patterns, url } = route

    const { backgroundColor: routeColor } = getColorAndNameFromRoute(
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

    const textColorOptions = [
      tinycolor(routeColor).darken(80).toHexString(),
      tinycolor(routeColor).lighten(80).toHexString()
    ]

    const textColor = tinycolor
      .mostReadable(routeColor, textColorOptions, {
        includeFallbackColors: true,
        level: 'AAA'
      })
      .toHexString()
    return (
      <div style={{ backgroundColor: routeColor, color: textColor }}>
        <Wrapper className={className} textColor={textColor}>
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
        </Wrapper>
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
        {pattern && <StopContainer>stops</StopContainer>}
      </div>
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
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteDetails)
