import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import A11yPrefs from './a11y-prefs'
import BackToTripPlanner from './back-to-trip-planner'
import DeleteUser from './delete-user'
import FavoritePlaceList from './places/favorite-place-list'
import NotificationPrefsPane from './notification-prefs-pane'
import StackedPaneDisplay from './stacked-pane-display'
import TermsOfUsePane from './terms-of-use-pane'

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = (props: {
  onCancel: () => void
  wheelchairEnabled: boolean
}) => {
  // The props include Formik props that provide access to the current user data
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { onCancel, wheelchairEnabled } = props
  const paneSequence = [
    {
      pane: FavoritePlaceList,
      props,
      title: <FormattedMessage id="components.ExistingAccountDisplay.places" />
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
      props
    }
  ]
  return (
    <div>
      <BackToTripPlanner />
      <StackedPaneDisplay
        onCancel={onCancel}
        paneSequence={paneSequence}
        title={
          <FormattedMessage id="components.ExistingAccountDisplay.mainTitle" />
        }
      />
    </div>
  )
}
// TODO: state type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStateToProps = (state: any) => {
  const { accessModes } = state.otp.config?.modes
  const wheelchairEnabled =
    accessModes &&
    accessModes.some(
      (mode: { showWheelchairSetting: boolean }) => mode.showWheelchairSetting
    )
  return {
    wheelchairEnabled
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExistingAccountDisplay)
