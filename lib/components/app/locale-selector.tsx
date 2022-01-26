import { CN, ES, FR, KR, US, VN } from 'country-flag-icons/react/3x2'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem, NavDropdown } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React, { MouseEvent } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'

/**
 * Renders flag icons for supported languages
 * using emojis would be a simpler solution, but they are not available on Windows
 * Exporting this in the config.js causes the a11y tests to fail. A better solution
 * will need to be found if further customization is required.
 */
const FLAG_ICON_MAPPING: Record<string, React.ReactElement> = {
  'en-US': <US style={{ width: 15 }} />,
  'es-ES': <ES style={{ width: 15 }} />,
  'fr-FR': <FR style={{ width: 15 }} />,
  'ko-KR': <KR style={{ width: 15 }} />,
  'vi-VN': <VN style={{ width: 15 }} />,
  'zh-CN': <CN style={{ width: 15 }} />
}

const FlagContainer = styled.span`
  &::after {
    content: '';
    margin: 0 0.125em;
  }
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
  const intl = useIntl()

  const handleLocaleSelection = (e: MouseEvent<Element>, locale: string) => {
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
    <NavDropdown id="locale-selector" title={FLAG_ICON_MAPPING[currentLocale]}>
      {Object.keys(configLanguages).map(
        (locale) =>
          locale !== 'allLanguages' &&
          locale !== currentLocale && (
            <MenuItem
              onClick={(e: MouseEvent) => handleLocaleSelection(e, locale)}
            >
              <FlagContainer>{FLAG_ICON_MAPPING[locale]}</FlagContainer>
              {configLanguages[locale].name}
            </MenuItem>
          )
      )}
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
