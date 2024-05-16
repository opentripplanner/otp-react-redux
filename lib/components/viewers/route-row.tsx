import { ArrowRight } from '@styled-icons/fa-solid'
import { IntlShape } from 'react-intl'
import React, { PureComponent } from 'react'
import styled from 'styled-components'

import { blue } from '../util/colors'
import { ComponentContext } from '../../util/contexts'
import { getFormattedMode } from '../../util/i18n'
import { getModeFromRoute } from '../../util/viewer'
import { Icon } from '../util/styledIcon'
import { SetViewedRouteHandler, ViewedRouteObject } from '../util/types'
import { TransitOperatorConfig } from '../../util/config-types'
import Link from '../util/link'
import OperatorLogo from '../util/operator-logo'

import RouteName from './route-name'

interface ButtonProps {
  display?: boolean
}

interface Props {
  findRouteIfNeeded: ({ routeId }: { routeId: string }) => void
  initialRender?: boolean
  intl: IntlShape
  isActive?: boolean
  operator: TransitOperatorConfig
  route?: ViewedRouteObject
  setViewedRoute: SetViewedRouteHandler
}

export const StyledRouteRow = styled.li`
  align-items: center;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 5px 0;
  min-height: 50px;
  position: relative;
`
// Route Row Button sits invisible on top of the route name and info.
export const RouteRowLink = styled(Link)`
  align-items: center;
  display: flex;
  min-height: 50px;
  padding: 5px;
  // Make sure route details always leaves enough room for pattern button
  padding-right: 55px;
  transition: all ease-out 0.1s;
  width: 100%;

  &.active {
    background-color: ${blue[50]};
    border-radius: 4px;
  }
`

export const OperatorImg = styled.img`
  height: 25px;
`

export const ModeIconElement = styled.span`
  display: inherit; // Allows for equal sizing and vertical centering of mode icons
  height: 28px;
  width: 28px;
`

const RouteDetailsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  margin-left: 5px;
  max-height: 180px;
  min-height: 36px;
  overflow: hidden;
`

const PatternButton = styled.button<ButtonProps>`
  background: transparent;
  border: none;
  border-radius: 50%;
  color: ${blue[900]};
  height: 40px;
  margin-right: 8px;
  position: absolute;
  right: 5px;
  transition: all ease-out 0.1s;
  z-index: ${(props) => (props.display ? 2 : -2)};
  width: 40px;

  svg {
    height: 22px !important;
    margin-top: -3px;
    opacity: ${(props) => (props.display ? '80%' : 0)};
    width: 22px !important;
  }

  :active {
    opacity: 100%;
    transition: all ease-out 0.1s;
  }

  &:hover {
    background: #fff;
    transition: all ease-out 0.1s;
  }
`

export class RouteRow extends PureComponent<Props> {
  activeRef: React.RefObject<HTMLLIElement>

  static contextType = ComponentContext

  constructor(props: Props) {
    super(props)
    // Create a ref used to scroll to
    this.activeRef = React.createRef<HTMLLIElement>()
  }

  componentDidMount = (): void => {
    const { isActive, route } = this.props
    if (isActive && route?.id) {
      // This is fired when coming back from the route details view
      this.activeRef.current?.scrollIntoView()
    }
  }

  componentDidUpdate(): void {
    /*
       If the initial route row list is being rendered and there is an active
       route, scroll to it. The initialRender prop prohibits the row being scrolled to
       if the user has clicked on a route
    */
    if (this.props.isActive && this.props.initialRender) {
      this.activeRef.current?.scrollIntoView()
    }
  }

  _onFocusOrEnter = (): void => {
    const { findRouteIfNeeded, route } = this.props
    const id = route?.id
    if (id) {
      findRouteIfNeeded({ routeId: id })
    }
  }

  _patternButtonClicked = (): void => {
    const { route, setViewedRoute } = this.props
    if (route) {
      const { id, patterns } = route
      const firstPattern = patterns && Object.values(patterns)?.[0]?.id
      setViewedRoute({ patternId: firstPattern, routeId: id })
    }
  }

  render(): JSX.Element | null {
    const { intl, isActive, operator, route } = this.props
    const { ModeIcon, RouteRenderer } = this.context

    if (!route) return null

    const patternViewerButtonText = intl.formatMessage({
      description: 'identifies the purpose of the pattern viewer button',
      id: 'components.RouteViewer.openPatternViewer'
    })

    return (
      <StyledRouteRow ref={this.activeRef}>
        <RouteRowLink
          className="clear-button-formatting"
          onFocus={this._onFocusOrEnter}
          onMouseEnter={this._onFocusOrEnter}
          onTouchStart={this._onFocusOrEnter}
          to={`/route/${route.id}`}
          tracking
        >
          <RouteDetailsContainer>
            <OperatorLogo operator={operator} />
            {route.mode && operator.routeIcons !== false && (
              <ModeIconElement>
                <ModeIcon
                  aria-label={getFormattedMode(
                    getModeFromRoute(route).toLowerCase(),
                    intl
                  )}
                  height={28}
                  leg={{
                    routeId: route.id,
                    routeLongName: route.longName,
                    routeShortName: route.shortName
                  }}
                  mode={getModeFromRoute(route)}
                  role="img"
                  width={28}
                />
              </ModeIconElement>
            )}
            <RouteName route={route} RouteRenderer={RouteRenderer} />
          </RouteDetailsContainer>
        </RouteRowLink>
        <PatternButton
          aria-label={patternViewerButtonText}
          display={isActive}
          id={`open-route-button-${route.shortName || route.longName}-${
            operator.name || '' // don't print 'undefined' if there is no operator.
          }`}
          onClick={this._patternButtonClicked}
          // Cannot keyboard navigate to the button unless it is visible
          tabIndex={isActive ? 0 : -1}
          title={patternViewerButtonText}
        >
          <Icon Icon={ArrowRight} />
        </PatternButton>
      </StyledRouteRow>
    )
  }
}
