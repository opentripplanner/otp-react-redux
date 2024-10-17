import { FormattedList, FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import React from 'react'

import { EditedUser } from '../types'
import { NONE_SINGLETON } from '../../../util/user'
import Link from '../../util/link'

/**
 * Renders a button to show the mobility profile settings.
 */
const MobilityPane = ({
  values: userData
}: FormikProps<EditedUser>): JSX.Element => {
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
      <Link className="btn btn-primary" to="/account/mobilityProfile/">
        <FormattedMessage id="components.MobilityProfile.MobilityPane.button" />
      </Link>
    </div>
  )
}

export default MobilityPane
