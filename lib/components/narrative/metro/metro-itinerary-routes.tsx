import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../../util/state-types'
import { ComponentContext } from '../../../util/contexts'
import { getFormattedMode } from '../../../util/i18n'
import FormattedDuration, {
  formatDuration
} from '../../util/formatted-duration'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import {
  getItineraryRoutes,
  removeInsignificantWalkLegs
} from './attribute-utils'
import RouteBlock from './route-block'

const Routes = styled.div<{ enableDot?: boolean }>`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px !important;

  svg {
    /* Fix for safari, where svg needs explicit width to render */
    width: 28px;
    /* Fix for our svg icons, which tend to be slightly off-center */
    &:not(.no-centering-fix) {
      margin-left: 0px;
    }
  }

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

// Invisible header rendered for screen readers and a11y technologies.
// HACK: This grid/column places the invisible header into an unused
// grid-cell to stop it from adding an additional row.
const InvisibleHeader = styled(InvisibleA11yLabel)`
  grid-column: 2;
  grid-row: 2;
`

type Props = {
  enableDot?: boolean
  /** This is true when there is only one itinerary being shown and the itinerary-body is visible */
  expanded: boolean
  itinerary: Itinerary
  showAllWalkLegs?: boolean
  showLegDurations?: boolean
}

const MetroItineraryRoutes = ({
  enableDot,
  expanded,
  itinerary,
  showAllWalkLegs,
  showLegDurations
}: Props): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error No type on ComponentContext
  const { FlexReservationIcon, LegIcon } = useContext(ComponentContext)
  const routeLegs = itinerary.legs
    .filter(showAllWalkLegs ? () => true : removeInsignificantWalkLegs)
    .filter((leg) => !leg.interlineWithPreviousLeg)
  const transitRoutes = getItineraryRoutes(itinerary, intl)

  const reservationWrapper = (
    <span style={{ marginLeft: '-1ch' }}>
      <FlexReservationIcon />
    </span>
  )

  return (
    <>
      <InvisibleHeader as={expanded ? 'h1' : undefined}>
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
      <Routes aria-hidden className="routes-container" enableDot={enableDot}>
        {routeLegs.map((leg: Leg, index: number, filteredLegs: Leg[]) => {
          const prevLeg = filteredLegs[index - 1]
          const previousLegMode = (index > 0 && prevLeg.mode) || undefined
          const previousLegReservation =
            index > 0 && coreUtils.itinerary.isReservationRequired(prevLeg)
          const needReservation = coreUtils.itinerary.isReservationRequired(leg)
          return (
            <RouteBlock
              footer={
                showLegDurations && (
                  <FormattedDuration duration={leg.duration} />
                )
              }
              hideLongName
              key={index}
              leg={leg}
              LegIcon={LegIcon}
              modeIconDecoration={needReservation && reservationWrapper}
              previousLegMode={
                needReservation === previousLegReservation
                  ? previousLegMode
                  : undefined
              }
              showDivider={enableDot}
            />
          )
        })}
      </Routes>
    </>
  )
}

const mapStateToProps = (state: AppReduxState) => ({
  enableDot: !state.otp.config.itinerary?.disableMetroSeperatorDot,
  showAllWalkLegs: state.otp.config.itinerary?.showAllWalkLegs
})

export default connect(mapStateToProps)(MetroItineraryRoutes)
