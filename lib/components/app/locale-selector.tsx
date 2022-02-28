import * as flags from 'country-flag-icons/react/3x2'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem, NavDropdown } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React, { MouseEvent } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import Icon from '../util/icon'

const FlagContainer = styled.span`
  &::after {
    content: '';
    margin: 0 0.125em;
  }

  align-items: center;
  display: inline-flex;
  justify-content: center;
  width: 15px;
`

type PropsFromRedux = ConnectedProps<typeof connector>

interface LocaleSelectorProps extends PropsFromRedux {
  // Typescript TODO configLanguageType
  configLanguages: Record<string, any>
  style?: any
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element => {
  const {
    configLanguages,
    createOrUpdateUser,
    locale: currentLocale,
    loggedInUser,
    setLocale
  } = props

  // If the currentLocale does not exist, avoid error by rendering US flag
  const CurrentLocaleFlag = configLanguages[currentLocale]
    ? flags[configLanguages[currentLocale].flag]
    : flags[configLanguages['en-US'].flag]
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
      title={<CurrentLocaleFlag style={{ width: 15 }} />}
    >
      {Object.keys(configLanguages).map((locale) => {
        const Flag = flags[configLanguages[locale].flag]
        return (
          locale !== 'allLanguages' && (
            <MenuItem
              onClick={(e: MouseEvent) => handleLocaleSelection(e, locale)}
            >
              <FlagContainer>
                {locale === currentLocale && <Icon type="check-square" />}
                {locale !== currentLocale && <Flag style={{ width: 15 }} />}
              </FlagContainer>
              {configLanguages[locale].name}
            </MenuItem>
          )
        )
      })}
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
