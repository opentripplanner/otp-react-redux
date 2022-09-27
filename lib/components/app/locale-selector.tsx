import { connect, ConnectedProps } from 'react-redux'
import { MenuItem, NavDropdown } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React, { MouseEvent } from 'react'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import Icon from '../util/icon'

type PropsFromRedux = ConnectedProps<typeof connector>

interface LocaleSelectorProps extends PropsFromRedux {
  // Typescript TODO configLanguageType
  configLanguages: Record<string, any>
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

  const handleLocaleSelection = (e: MouseEvent<Element>, locale: string) => {
    e.stopPropagation()
    if (locale === currentLocale) {
      e.preventDefault()
      return
    }
    window.localStorage.setItem('lang', locale)

    if (loggedInUser) {
      loggedInUser.preferredLanguage = locale
      createOrUpdateUser(loggedInUser, false, intl)
    }
    setLocale(locale)

    document.location.reload()
  }

  return (
    <NavDropdown
      id="locale-selector"
      pullRight
      title={
        <Icon style={{ color: 'rgba(255, 255, 255, 0.85)' }} type="globe" />
      }
    >
      {Object.keys(configLanguages)
        .filter((locale) => locale !== 'allLanguages')
        .map((locale) => (
          <MenuItem
            className="locale-name"
            key={locale}
            onClick={(e: MouseEvent) => handleLocaleSelection(e, locale)}
          >
            <span
              style={locale === currentLocale ? { fontWeight: 'bold' } : {}}
            >
              {configLanguages[locale].name}
            </span>
          </MenuItem>
        ))}
    </NavDropdown>
  )
}

// Typescript TODO: type state properly
const mapStateToProps = (state: any) => {
  return {
    locale: state.otp.ui.locale,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  setLocale: uiActions.setLocale
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(LocaleSelector)
