import { FormattedMessage, IntlShape } from 'react-intl'
import React, { ReactNode } from 'react'

import { EditedUser } from './types'
import AccountSetupFinishPane from './account-setup-finish-pane'
import AssistiveDevicesPane from './mobility-profile/assistive-devices-pane'
import DeleteUser from './delete-user'
import FavoritePlaceList from './places/favorite-place-list'
import LimitationsPane from './mobility-profile/limitations-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import TermsOfUsePane from './terms-of-use-pane'

export interface PaneProps {
  backButton?: any // ComponentType does not play well with ExistingAccountDisplay.
  getInvalidMessage?: (intl: IntlShape) => string
  id: string
  isInvalid?: (arg: any) => boolean
  pane: any
  title: ReactNode
}

const standardPanes: Record<string, PaneProps> = {
  finish: {
    id: 'finish',
    pane: AccountSetupFinishPane,
    title: <FormattedMessage id="components.NewAccountWizard.finish" />
  },
  mobilityDevices: {
    id: 'mobilityDevices',
    pane: AssistiveDevicesPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  mobilityLimitations: {
    id: 'mobilityLimitations',
    pane: LimitationsPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  notifications: {
    getInvalidMessage: (intl: IntlShape) =>
      intl.formatMessage({
        id: 'components.PhoneNumberEditor.verifySms'
      }),
    id: 'notifications',
    isInvalid: ({
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    }: EditedUser) =>
      notificationChannel?.includes('sms') &&
      (!phoneNumber || !isPhoneNumberVerified),
    pane: NotificationPrefsPane,
    title: <FormattedMessage id="components.NewAccountWizard.notifications" />
  },
  places: {
    id: 'places',
    pane: FavoritePlaceList,
    title: <FormattedMessage id="components.NewAccountWizard.places" />
  },
  terms: {
    backButton: DeleteUser,
    getInvalidMessage: (intl: IntlShape) =>
      intl.formatMessage({
        id: 'components.TermsOfUsePane.mustAgreeToTerms'
      }),
    id: 'terms',
    isInvalid: ({ hasConsentedToTerms }: EditedUser) => !hasConsentedToTerms,
    pane: TermsOfUsePane,
    title: (
      <FormattedMessage id="components.NewAccountWizard.createNewAccount" />
    )
  }
}

export default standardPanes
