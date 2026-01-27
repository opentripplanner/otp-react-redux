import { isTransitLeg } from '@opentripplanner/core-utils/lib/itinerary'
import { Leg } from '@opentripplanner/types'
import { useIntl } from 'react-intl'

import { ComponentContext } from '../../../util/contexts'
import { getFormattedMode } from '../../../util/i18n'
import React, { useContext } from 'react'

import InvisibleA11yLabel from '../../util/invisible-a11y-label'

type Props = {
  leg: Leg
}

const LegIconWithA11y = (props: Props): JSX.Element => {
  // @ts-expect-error No type on ComponentContext
  const { LegIcon } = useContext(ComponentContext)
  const intl = useIntl()
  const { leg } = props
  const { mode } = leg
  const ariaLabel = isTransitLeg(leg) ? getFormattedMode(mode, intl) : null
  return (
    <>
      <LegIcon {...props} />
      {ariaLabel && <InvisibleA11yLabel>{ariaLabel}</InvisibleA11yLabel>}
    </>
  )
}

export default LegIconWithA11y
