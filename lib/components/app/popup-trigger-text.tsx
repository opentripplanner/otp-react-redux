import { FormattedMessage, useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import InvisibleA11yLabel from '../util/invisible-a11y-label'

interface Props {
  compact?: boolean
  popupTarget: string
}

const isMobile = coreUtils.ui.isMobile()

/**
 * Renders the text for the button that triggers the survey/other popup.
 * Includes "Opens in a new window" a11y indication in mobile view.
 */
const PopupTriggerText = ({ compact, popupTarget }: Props): JSX.Element => {
  const intl = useIntl()
  const normalText = intl.formatMessage({
    id: `config.popups.${popupTarget}`
  })

  return (
    <>
      {compact ? (
        <FormattedMessage
          defaultMessage={normalText}
          id={`config.popups.${popupTarget}-narrow`}
        />
      ) : (
        normalText
      )}
      {isMobile && (
        <InvisibleA11yLabel>
          <FormattedMessage id="common.linkOpensNewWindow" />
        </InvisibleA11yLabel>
      )}
    </>
  )
}

export default PopupTriggerText
