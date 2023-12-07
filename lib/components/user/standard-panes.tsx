import { FormattedMessage, IntlShape } from 'react-intl'
import React, { ReactNode } from 'react'

export interface PaneProps {
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
  mobility1: {
    id: 'mobility1',
    pane: AssistiveDevicesPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  mobility2: {
    id: 'mobility2',
    pane: LimitationsPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  notifications: {
    getInvalidMessage: (intl: IntlShape) =>
      intl.formatMessage({
        id: 'components.PhoneNumberEditor.invalidPhone'
      }),
    id: 'notifications',
    isInvalid: ({
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    }: EditedUser) => {
      return (
        notificationChannel?.includes('sms') &&
        (!phoneNumber || !isPhoneNumberVerified)
      )
    },
    pane: NotificationPrefsPane,
    title: <FormattedMessage id="components.NewAccountWizard.notifications" />
  },
  places: {
    id: 'places',
    pane: FavoritePlaceList,
    title: <FormattedMessage id="components.NewAccountWizard.places" />
  },
  terms: {
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
