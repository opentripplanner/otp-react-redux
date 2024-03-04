import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { FormikProps } from 'formik'
import React from 'react'

import { AppReduxState } from '../../util/state-types'
import { TransitModeConfig } from '../../util/config-types'
import PageTitle from '../util/page-title'

import { EditedUser } from './types'
import A11yPrefs from './a11y-prefs'
import BackToTripPlanner from './back-to-trip-planner'
import DeleteUser from './delete-user'
import FavoritePlaceList from './places/favorite-place-list'
import MobilityPane from './mobility-profile/mobility-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import StackedPanes from './stacked-panes'
import TermsOfUsePane from './terms-of-use-pane'

interface Props extends FormikProps<EditedUser> {
  mobilityProfileEnabled: boolean
  wheelchairEnabled: boolean
}

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = (props: Props) => {
  // The props include Formik props that provide access to the current user data
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.

  const { mobilityProfileEnabled, wheelchairEnabled } = props
  const intl = useIntl()

  const panes = [
    {
      pane: FavoritePlaceList,
      props,
      title: <FormattedMessage id="components.ExistingAccountDisplay.places" />
    },
    {
      hidden: !mobilityProfileEnabled,
      pane: MobilityPane,
      props,
      title: (
        <FormattedMessage id="components.MobilityProfile.MobilityPane.header" />
      )
    },
    {
      pane: NotificationPrefsPane,
      props,
      title: (
        <FormattedMessage id="components.ExistingAccountDisplay.notifications" />
      )
    },
    {
      // Only show option to plan accessible trips by default if accessible trips are possible
      hidden: !wheelchairEnabled,
      pane: A11yPrefs,
      props,
      title: <FormattedMessage id="components.ExistingAccountDisplay.a11y" />
    },
    {
      pane: TermsOfUsePane,
      props: { ...props, disableCheckTerms: true },
      title: <FormattedMessage id="components.ExistingAccountDisplay.terms" />
    },
    {
      pane: DeleteUser,
      props: { block: true, size: 'large' }
    }
  ]

  // Repeat text from the SubNav component in the title bar for brevity.
  const settings = intl.formatMessage({
    id: 'components.SubNav.settings'
  })
  const myAccount = intl.formatMessage({
    id: 'components.SubNav.myAccount'
  })
  return (
    <div>
      <BackToTripPlanner />
      <PageTitle title={[settings, myAccount]} />
      <StackedPanes
        panes={panes}
        title={
          <FormattedMessage id="components.ExistingAccountDisplay.mainTitle" />
        }
      />
    </div>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { mobilityProfile: mobilityProfileEnabled = false, modes } =
    state.otp.config
  const wheelchairEnabled = modes.accessModes?.some(
    (mode: TransitModeConfig) => mode.showWheelchairSetting
  )
  return {
    mobilityProfileEnabled,
    wheelchairEnabled
  }
}

export default connect(mapStateToProps)(ExistingAccountDisplay)
