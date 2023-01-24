import { connect } from 'react-redux'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { useIntl } from 'react-intl'
import React from 'react'

import * as uiActions from '../../actions/ui'
import { getLanguageOptions } from '../../util/i18n'
import { UnstyledButton } from '../util/unstyled-button'
import Dropdown from '../util/dropdown'

interface LocaleSelectorProps {
  // Typescript TODO configLanguageType
  configLanguages: Record<string, any>
  locale: string
  setLocale: (locale: string) => void
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element | null => {
  const { configLanguages, locale: currentLocale, setLocale } = props
  const languageOptions: Record<string, any> | null =
    getLanguageOptions(configLanguages)
  const intl = useIntl()

  // Only render if two or more languages are configured.
  return languageOptions ? (
    <Dropdown
      id="locale-selector"
      label={intl.formatMessage({ id: 'components.SubNav.selectALanguage' })}
      listLabel={intl.formatMessage({ id: 'components.SubNav.languages' })}
      name={
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.85)'
          }}
        >
          <GlobeAmericas height="18px" />
        </span>
      }
      style={{ display: 'block ruby' }}
      // TODO: How to make this work without block ruby?
    >
      {Object.keys(languageOptions).map((locale: string) => (
        <li
          aria-selected={locale === currentLocale}
          key={locale}
          lang={locale}
          onClick={() => setLocale(locale)}
          onKeyPress={() => setLocale(locale)}
          // We are correct, not eslint: https://w3c.github.io/aria-practices/examples/combobox/combobox-select-only.html
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
          role="option"
          tabIndex={0}
        >
          <UnstyledButton
            style={locale === currentLocale ? { fontWeight: 'bold' } : {}}
            tabIndex={-1}
          >
            {languageOptions[locale].name}
          </UnstyledButton>
        </li>
      ))}
    </Dropdown>
  ) : null
}

// Typescript TODO: type state properly
const mapStateToProps = (state: any) => {
  return {
    locale: state.otp.ui.locale
  }
}

const mapDispatchToProps = {
  setLocale: uiActions.setLocale
}

export default connect(mapStateToProps, mapDispatchToProps)(LocaleSelector)
