import { Leg } from '@opentripplanner/types'

import { getFormattedMode } from '../../../util/i18n'
import coreUtils from '@opentripplanner/core-utils'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import React, { useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'

import { useIntl } from 'react-intl'

type Props = {
  leg: Leg
}

const LegIconWithA11y = (props: Props): JSX.Element => {
  // @ts-expect-error No type on ComponentContext
  const { LegIcon } = useContext(ComponentContext)
  const intl = useIntl()
  const { leg } = props
  const { mode, transitLeg } = leg
  const ariaLabel = transitLeg ? getFormattedMode(mode, intl) : null
  return (
    <>
      <LegIcon {...props} />
      {ariaLabel && <InvisibleA11yLabel>{ariaLabel}</InvisibleA11yLabel>}
    </>
  )
}

export default LegIconWithA11y
