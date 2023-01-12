import { connect, ConnectedProps } from 'react-redux'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { useIntl } from 'react-intl'
import React, { MouseEvent } from 'react'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { StyledIconWrapper } from '../util/styledIcon'
import Dropdown from '../util/dropdown'

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
    <Dropdown
      id="locale-selector"
      // TODO: How to make this work without block ruby?
      style={{ display: 'block ruby' }}
      title={
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.85)'
          }}
        >
          <GlobeAmericas />
        </span>
      }
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {Object.keys(configLanguages)
          .filter((locale) => locale !== 'allLanguages')
          .map((locale) => (
            <li
              aria-selected={locale === currentLocale}
              key={locale}
              onClick={(e: MouseEvent) => handleLocaleSelection(e, locale)}
              onKeyPress={(e: any) => handleLocaleSelection(e, locale)}
              // We are correct, not eslint: https://w3c.github.io/aria-practices/examples/combobox/combobox-select-only.html
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
              role="option"
            >
              <span
                style={locale === currentLocale ? { fontWeight: 'bold' } : {}}
              >
                {configLanguages[locale].name}
              </span>
            </li>
          ))}
      </ul>
    </Dropdown>
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
