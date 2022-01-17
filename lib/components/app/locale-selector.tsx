import { connect } from 'react-redux'
import { MenuItem, NavDropdown } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { FLAG_ICON_MAPPING } from '../../config'

const FlagContainer = styled.span`
  &::after {
    margin: 0 0.125em;
  }
`

export type LocaleSelectorProps = {
  // TODO configLanguageType
  configLanguages: Record<string, unknown>
  createOrUpdateUser: typeof userActions.createOrUpdateUser
  currentLocale: string
  locale: string
  // TODO: add loggedInUserType
  loggedInUser?: Record<string, unknown>
  setLocale: typeof uiActions.setLocale
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element => {
  const {
    configLanguages,
    createOrUpdateUser,
    locale: currentLocale,
    loggedInUser,
    setLocale
  } = props
  const intl = useIntl()

  const handleLocaleSelection = (e, locale) => {
    e.stopPropagation()

    window.localStorage.setItem('lang', locale)

    if (loggedInUser) {
      loggedInUser.preferredLanguage = locale
      createOrUpdateUser(loggedInUser, false, intl)
    }
    setLocale(locale)

    // Hack: Reload the page (IntlProvider is at too high a level to listen to the redux store)
    // TODO: move IntlProvider to Responsive Webapp for reload.
    document.location.reload()
  }

  return (
    <NavDropdown title={FLAG_ICON_MAPPING[currentLocale]}>
      {Object.keys(configLanguages).map(
        (key) =>
          /* Key is locale code, e.g. 'en-US' */
          key !== currentLocale && (
            <MenuItem onClick={(e) => handleLocaleSelection(e, key)}>
              <FlagContainer>{FLAG_ICON_MAPPING[key]}</FlagContainer>
              {configLanguages[key].name}
            </MenuItem>
          )
      )}
    </NavDropdown>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    locale: state.otp.ui.locale,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  setLocale: uiActions.setLocale
}

export default connect(mapStateToProps, mapDispatchToProps)(LocaleSelector)
