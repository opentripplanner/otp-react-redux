import { Leg } from '@opentripplanner/types'
import { RouteLongName } from '@opentripplanner/itinerary-body/lib/defaults'
import { useIntl } from 'react-intl'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { getFormattedMode } from '../../../util/i18n'

import DefaultRouteRenderer from './default-route-renderer'

type Props = {
  LegIcon: ({ height, leg }: { height: number; leg: Leg }) => React.ReactElement
  hideLongName?: boolean
  leg: Leg & {
    alternateRoutes?: {
      [id: string]: {
        agencyId?: string
        mode?: string
        routeColor?: string
        routeShortName?: string
      }
    }
  }
  previousLegMode?: string
}

const Wrapper = styled.span.attrs((props) => {
  return { 'aria-label': props['aria-label'] }
})`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 7.5px;
`

const MultiWrapper = styled.span<{ multi?: boolean }>`
  flex-direction: row;
  display: flex;
  gap: 5px;

  ${({ multi }) =>
    multi
      ? `
  /* All Route blocks start with only right side triangulated */
  section {
    clip-path: polygon(0% 0, 100% 0%, 75% 100%, 0% 100%);
    padding-right: 10px;
    padding-left: 5px;
    margin-right: 2px;
  }
  section:first-of-type {
    border-top-right-radius: 0!important;
    border-bottom-right-radius: 0!important;
  }
  /* Middle route block(s), with both sides triangulated */
  section:not(:first-of-type):not(:last-of-type) {
    clip-path: polygon(25% 0, 100% 0%, 75% 100%, 0% 100%);
    padding-left: 11px;
    padding-right: 11px;
    margin-left: -10px;
  }
  /* Last route block, with only left side triangulated */
  section:last-of-type {
    clip-path: polygon(25% 0, 100% 0%, 100% 100%, 0% 100%);
    padding-left: 10px;
    margin-left: -10px;
    padding-right: 5px;

    border-bottom-left-radius: 0!important;
    border-top-left-radius: 0!important;
  }
  `
      : ''}
`

const LegIconWrapper = styled.span`
  width: 28px;
`

const RouteBlock = ({
  hideLongName,
  leg,
  LegIcon,
  previousLegMode
}: Props): React.ReactElement | null => {
  // @ts-expect-error React context is populated dynamically
  const { RouteRenderer } = useContext(ComponentContext)
  const intl = useIntl()
  const Route = RouteRenderer || DefaultRouteRenderer

  return (
    <Wrapper
      // TODO: include route names in aria label
      aria-label={getFormattedMode(leg.mode, intl)}
      className="route-block-wrapper"
    >
      {leg.mode !== previousLegMode && (
        <LegIconWrapper>
          <LegIcon height={28} leg={leg} />
        </LegIconWrapper>
      )}
      {leg.routeShortName && (
        <MultiWrapper multi={!!leg.alternateRoutes}>
          <Route leg={leg} />
          {Object.entries(leg?.alternateRoutes || {})?.map((altRoute) => {
            const route = altRoute[1]
            return <Route key={altRoute[0]} leg={route} />
          })}
        </MultiWrapper>
      )}
      {!hideLongName && leg.routeLongName && <RouteLongName leg={leg} />}
    </Wrapper>
  )
}

export default RouteBlock
