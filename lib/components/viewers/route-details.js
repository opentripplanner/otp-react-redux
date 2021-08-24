import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import tinycolor from 'tinycolor2'

import Icon from '../narrative/icon'

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

  h4 {
      margin-bottom: 0px;
  }

  button {
      color: inherit;
      border-bottom: 3px solid ${(props) => props.textColor};
  }

  button:hover, button:focus, button:visited {
    text-decoration: none;
  }
  button:hover,  button:focus {
      color: ${(props) => props.color};
      background-color: ${(props) => props.textColor};
  }
}
`

class RouteDetails extends Component {
  static propTypes = {
    color: PropTypes.string,
    contrastColor: PropTypes.string,
    route: PropTypes.shape({ id: PropTypes.string })
  };
  render () {
    const { className, route, routeColor } = this.props
    const { agency, url } = route

    const textColorOptions = [
      tinycolor(routeColor).lighten(80).toHexString(),
      tinycolor(routeColor).darken(80).toHexString()
    ]

    const textColor = tinycolor
      .mostReadable(routeColor, textColorOptions, {
        includeFallbackColors: true,
        level: 'AAA'
      })
      .toHexString()
    return (
      <div>
        <Wrapper className={className} textColor={textColor}>
          <LogoLinkContainer>
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
          <Button bsStyle='link'>Place one</Button>
        </PatternContainer>
      </div>
    )
  }
}

const StyledRouteDetails = styled(RouteDetails)`
  background-color: ${(props) => props.routeColor};
  color: ${(props) => props.textColor};
`

export default StyledRouteDetails
