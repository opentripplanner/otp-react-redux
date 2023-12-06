import { Form, FormikProps } from 'formik'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import React, { useCallback } from 'react'
import toast from 'react-hot-toast'

import { EditedUser } from '../types'
import AccountSetupFinishPane from '../account-setup-finish-pane'
import AssistiveDevicesPane from '../mobility-profile/assistive-devices-pane'
import FavoritePlaceList from '../places/favorite-place-list'
import LimitationsPane from '../mobility-profile/limitations-pane'
import NotificationPrefsPane from '../notification-prefs-pane'
import PageTitle from '../../util/page-title'
import SequentialPaneDisplay, { PaneProps } from '../sequential-pane-display'
import TermsOfUsePane from '../terms-of-use-pane'

// The props include Formik props that provide access to the current user data (stored in props.values)
// and to its own blur/change/submit event handlers that automate the state.
// We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
// can be wired to be managed by Formik.
interface Props {
  activePaneId: string
  formikProps: FormikProps<EditedUser>
  onNext?: () => void
  originRoute?: string
  pages: string[]
  routeTo: (to: string) => void
  title: string
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

function getPanes(pageIds: string[]): PaneProps[] {
  return pageIds.map((pageId) => standardPanes[pageId])
}

/**
 * Basic component to build wizards (step-by-step forms).
 */
const Wizard = ({
  activePaneId,
  formikProps,
  originRoute = '/',
  pages,
  title
}: Props): JSX.Element => {
  const intl = useIntl()

  const handleFinish = useCallback(() => {
    // Display a toast to acknowledge saved changes
    // (although in reality, changes quietly took effect in previous screens).
    toast.success(intl.formatMessage({ id: 'actions.user.preferencesSaved' }))

    routeTo(originRoute)
  }, [intl, originRoute])

  return (
    <Form id="user-settings-form" noValidate>
      <PageTitle title={title} />
      <SequentialPaneDisplay
        activePaneId={activePaneId}
        onFinish={handleFinish}
        onNext={onNext}
        paneProps={formikProps}
        panes={getPanes(pages)}
      />
    </Form>
  )
}

export default Wizard
