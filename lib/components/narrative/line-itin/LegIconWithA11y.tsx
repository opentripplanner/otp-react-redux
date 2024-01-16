import { connect } from 'react-redux'

import { checkForModeIconOverrides } from '../../../util/config'
import { getFormattedMode } from '../../../util/i18n'
import coreUtils from '@opentripplanner/core-utils'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import React, { useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'

import { useIntl } from 'react-intl'

const { isTransit } = coreUtils.itinerary

const LegIconWithA11y = (props: any) => {
  // @ts-expect-error No type on ComponentContext
  const { LegIcon } = useContext(ComponentContext)
  const intl = useIntl()
  const { leg, modeIconOverrides } = props
  const iconOverride = checkForModeIconOverrides(
    leg.routeId,
    leg.mode,
    modeIconOverrides
  )

  const { mode } = leg
  const ariaLabel = isTransit(mode) ? getFormattedMode(mode, intl) : null
  const legProps = {
    ...props,
    iconOverride
  }

  return (
    <>
      <LegIcon {...legProps} />
      {ariaLabel && <InvisibleA11yLabel>{ariaLabel}</InvisibleA11yLabel>}
    </>
  )
}

const mapStateToProps = (state: any) => {
  const { modeIconOverrides } = state.otp.config
  return { modeIconOverrides }
}

export default connect(mapStateToProps)(LegIconWithA11y)
