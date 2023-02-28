import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

import { getFormattedMode } from '../../../util/i18n'
import FormattedDuration, {
  formatDuration
} from '../../util/formatted-duration'

import {
  getItineraryRoutes,
  removeInsignifigantWalkLegs
} from './attribute-utils'
import RouteBlock from './route-block'

const ItineraryGrid = styled.div`
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, minmax(50%, 1fr));
  padding: 10px 1em;

  svg {
    /* Fix for safari, where svg needs explicit width to render */
    width: 28px;
    /* Fix for our svg icons, which tend to be slightly off-center */
    &:not(.no-centering-fix) {
      margin-left: 0px;
    }
  }
`

const Routes = styled.section<{ enableDot?: boolean }>`
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  grid-column-start: 1;
  margin-top: 10px;

  ${(props) =>
    !props?.enableDot &&
    `
    .route-block-wrapper {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
      padding: 6px;
    }
    /* Slight margin adjustments for "bubble" */
    .route-block-wrapper svg:first-of-type {
      margin-left: 5px;
    }
    .route-block-wrapper section:first-of-type {
      margin-left: -4px;
    }
  `}
`

// invisible header rendered for screen readers and a11y technologies
const InvisibleHeader = styled.span`
  /* TODO: This grid/column places the invisbile header into an unused 
  grid-cell to stop it from adding an additional row. There is probably 
  a better way to do this! */
  grid-column: 2;
  grid-row: 2;
  height: 0;
  overflow: hidden;
  width: 0;
`

type Props = {
  LegIcon: React.ReactNode
  enableDot?: boolean
  /** This is true when there is only one itinerary being shown and the itinerary-body is visible */
  expanded: boolean
  itinerary: Itinerary
  showLegDurations?: boolean
}

const MetroItineraryRoutes = ({
  enableDot,
  expanded,
  itinerary,
  LegIcon,
  showLegDurations
}: Props): JSX.Element => {
  const intl = useIntl()
  const routeLegs = itinerary.legs.filter(removeInsignifigantWalkLegs)
  const transitRoutes = getItineraryRoutes(itinerary, intl)

  return (
    <ItineraryGrid>
      <InvisibleHeader as={expanded && 'h1'}>
        {String(transitRoutes) ? (
          <FormattedMessage
            id="components.MetroUI.itineraryDescription"
            values={{
              routes: transitRoutes,
              time: formatDuration(itinerary.duration, intl, false)
            }}
          />
        ) : (
          <FormattedMessage
            id="components.MetroUI.singleModeItineraryDescription"
            values={{
              mode: getFormattedMode(itinerary.legs[0].mode, intl),
              time: formatDuration(itinerary.duration, intl, false)
            }}
          />
        )}
      </InvisibleHeader>
      <Routes aria-hidden enableDot={enableDot}>
        {routeLegs.map((leg: Leg, index: number, filteredLegs: Leg[]) => {
          const previousLegMode =
            (index > 0 && filteredLegs[index - 1].mode) || undefined
          return (
            <RouteBlock
              aria-hidden
              footer={
                showLegDurations && (
                  <FormattedDuration
                    duration={leg.duration}
                    includeSeconds={false}
                  />
                )
              }
              hideLongName
              key={index}
              leg={leg}
              LegIcon={LegIcon}
              previousLegMode={previousLegMode}
              showDivider={enableDot}
            />
          )
        })}
      </Routes>
    </ItineraryGrid>
  )
}

// TODO: state type
const mapStateToProps = (state: any) => ({
  enableDot: !state.otp.config.itinerary?.disableMetroSeperatorDot
})

export default connect(mapStateToProps)(MetroItineraryRoutes)
