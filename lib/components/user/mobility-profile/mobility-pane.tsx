import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedList, FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import React, { useCallback } from 'react'

import * as uiActions from '../../../actions/ui'
import { EditedUser } from '../types'
import { NONE_SINGLETON } from '../../../util/user'

interface Props extends FormikProps<EditedUser> {
  routeTo: (url: string) => void
}

/**
 * Renders a button to show the mobility profile settings.
 */
const MobilityPane = ({ routeTo, values: userData }: Props): JSX.Element => {
  const handleClick = useCallback(() => {
    routeTo('/account/mobilityProfile/')
  }, [routeTo])
  const {
    isMobilityLimited,
    mobilityDevices = [],
    visionLimitation
  } = userData.mobilityProfile || {}
  const devices = mobilityDevices.length ? mobilityDevices : NONE_SINGLETON
  return (
    <div>
      <p>
        <FormattedMessage id="components.MobilityProfile.MobilityPane.mobilityDevices" />
        <FormattedList
          // `style` below is a react-intl -specific prop.
          // eslint-disable-next-line react/style-prop-object
          style="narrow" // Should suppress the ending "and" in "a, b, and c".
          type="conjunction"
          value={devices.map((dv) => (
            <FormattedMessage
              id={`components.MobilityProfile.DevicesPane.devices.${dv}`}
              key={dv}
            />
          ))}
        />
        <br />
        <FormattedMessage id="components.MobilityProfile.MobilityPane.mobilityLimitations" />
        {isMobilityLimited ? (
          <FormattedMessage id="common.forms.yes" />
        ) : (
          <FormattedMessage id="common.forms.no" />
        )}
        <br />
        <FormattedMessage id="components.MobilityProfile.MobilityPane.visionLimitations" />
        <FormattedMessage
          id={`components.MobilityProfile.LimitationsPane.visionLimitations.${visionLimitation}`}
        />
      </p>
      <Button bsStyle="primary" onClick={handleClick}>
        <FormattedMessage id="components.MobilityProfile.MobilityPane.button" />
      </Button>
    </div>
  )
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(null, mapDispatchToProps)(MobilityPane)
