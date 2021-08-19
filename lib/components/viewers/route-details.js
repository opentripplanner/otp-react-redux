import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'

import Icon from '../narrative/icon'

/** Converts text color (either black or white) to rgb */
const textHexToRgb = (color) => (color === '#ffffff' ? '255,255,255' : '0,0,0')

const Wrapper = styled.div`
  padding: 8px;
`
const LogoLinkContainer = styled.div`
  display: flex;
  padding-top: 10px;
  justify-content: space-between;
`
const MoreDetailsLink = styled.a`
    color: ${(props) => props.color};
    background-color: rgba(${(props) => textHexToRgb(props.color)},0.1);
    padding: 5px;
    border-radius: 5px;
    transition: 0.1s all ease-in-out;

    &:hover {
        background-color: rgba(255,255,255,0.8);
        color: #333;
    }
}
`
const PatternContainer = styled.div`
  background-color: ${(props) => props.color};
  color: ${(props) => props.textColor};
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  gap: 16px;
  padding: 0 8px;
  margin: 0;
  filter: saturate(200%);

  h4 {
      margin-bottom: 0px;
  }

  button {
      color: inherit;
      border-bottom: 3px solid ${(props) => props.textColor};
  }

  button:hover {
      color: ${(props) => props.color};
      background-color: ${(props) => props.textColor};
      text-decoration: none;
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
    const { className, route, routeColor, textColor } = this.props
    const { agency, url } = route
    return (
      <div>
        <Wrapper className={className}>
          This route runs every ?? minutes, ?? days of the week.
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
