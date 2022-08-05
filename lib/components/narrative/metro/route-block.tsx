import { FormattedMessage } from 'react-intl'
import { Leg } from '@opentripplanner/types'
import { RouteLongName } from '@opentripplanner/itinerary-body/lib/defaults'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'

import DefaultRouteRenderer from './default-route-renderer'

type Props = {
  LegIcon: ({ height, leg }: { height: number; leg: Leg }) => React.ReactElement
  footer?: React.ReactNode
  hideLongName?: boolean
  leg: Leg & {
    alternateRoutes?: {
      [id: string]: Leg
    }
  }
  previousLegMode?: string
  showDivider?: boolean
}

const Wrapper = styled.span`
  align-items: center;
  column-gap: 4px;
  display: grid;
  grid-template-columns: fit-content(100%);
  justify-content: flex-start;
  margin-left: -4px; /* counteract gap */

  footer {
    align-self: center;
    font-size: 12px;
    grid-column: 1 / span 2;
    justify-self: center;
    opacity: 0.7;
  }
`

const MultiWrapper = styled.span<{ multi?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 5px;
  grid-column: 2;
  grid-row: 1;

  ${({ multi }) =>
    multi
      ? `
  /* All Route blocks start with only right side triangulated */
  section {
    clip-path: polygon(0% 0, 100% 0%, 75% 100%, 0% 100%);
    margin-right: 2px;
    max-width: 100px;
    padding-left: 5px;
    padding-right: 10px;
  }
  section:first-of-type {
    border-bottom-right-radius: 0!important;
    border-top-right-radius: 0!important;
  }
  /* Middle route block(s), with both sides triangulated */
  section:not(:first-of-type):not(:last-of-type) {
    border-radius: 0;
    clip-path: polygon(25% 0, 100% 0%, 75% 100%, 0% 100%);
    margin-left: -10px;
    padding-left: 11px;
    padding-right: 11px;
  }
  /* Last route block, with only left side triangulated */
  section:last-of-type {
    border-bottom-left-radius: 0!important;
    border-top-left-radius: 0!important;
    clip-path: polygon(25% 0, 100% 0%, 100% 100%, 0% 100%);
    margin-left: -10px;
    padding-left: 10px;
    padding-right: 5px;
  }
  `
      : ''}
`

const LegIconWrapper = styled.span`
  height: 28px;
  max-width: 28px;
`

const MultiRouteLongName = styled.div`
  align-items: baseline;
  align-self: center;
  display: flex;
  gap: 5px;
  grid-column: 3;
  grid-row: 1;
  justify-content: space-between;
`

const Divider = styled.span`
  align-items: center;
  display: flex;
  margin: 0 -5px;
  opacity: 0.4;
`

const RouteBlock = ({
  footer,
  hideLongName,
  leg,
  LegIcon,
  previousLegMode,
  showDivider
}: Props): React.ReactElement | null => {
  // @ts-expect-error React context is populated dynamically
  const { RouteRenderer } = useContext(ComponentContext)
  const Route = RouteRenderer || DefaultRouteRenderer

  return (
    <>
      {showDivider && previousLegMode && <Divider>•</Divider>}
      <Wrapper className="route-block-wrapper">
        {leg.mode !== previousLegMode && (
          <LegIconWrapper>
            <LegIcon height={28} leg={leg} />
          </LegIconWrapper>
        )}
        {(leg.routeShortName || leg.route || leg.routeLongName) && (
          <MultiWrapper multi={!!leg.alternateRoutes}>
            <Route leg={leg} />
            {Object.entries(leg?.alternateRoutes || {})?.map((altRoute) => {
              const route = altRoute[1]
              return <Route key={altRoute[0]} leg={route} />
            })}
          </MultiWrapper>
        )}
        {!hideLongName && leg.routeLongName && (
          <MultiRouteLongName>
            <RouteLongName leg={leg} />
            {Object.entries(leg?.alternateRoutes || {})?.length > 0 && (
              <em style={{ marginRight: 10 }}>
                <FormattedMessage id="components.MetroUI.orAlternatives" />
              </em>
            )}
          </MultiRouteLongName>
        )}
        {/** TODO: should this be a footer tag? */}
        {footer && <footer>{footer}</footer>}
      </Wrapper>
    </>
  )
}

export default RouteBlock
