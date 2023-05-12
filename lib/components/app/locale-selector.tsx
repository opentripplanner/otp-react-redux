import { connect } from 'react-redux'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { useIntl } from 'react-intl'
import React from 'react'

import * as uiActions from '../../actions/ui'
import { getLanguageOptions } from '../../util/i18n'
import { UnstyledButton } from '../util/unstyled-button'
import Dropdown from '../util/dropdown'

interface LocaleSelectorProps {
  // Typescript TODO languageOptions based on configLanguage type.
  languageOptions: Record<string, any> | null
  locale: string
  setLocale: (locale: string) => void
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element | null => {
  const { languageOptions, locale: currentLocale, setLocale } = props
  const intl = useIntl()

  // Only render if two or more languages are configured.
  return languageOptions ? (
    <Dropdown
      id="locale-selector"
      label={intl.formatMessage({ id: 'components.SubNav.selectALanguage' })}
      listLabel={intl.formatMessage({ id: 'components.SubNav.languages' })}
      locale
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
        <li key={locale} lang={locale} role="none">
          <UnstyledButton
            aria-selected={locale === currentLocale || undefined}
            onClick={() => setLocale(locale)}
            role="option"
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
    languageOptions: getLanguageOptions(state.otp.config.language),
    locale: state.otp.ui.locale
  }
}

const mapDispatchToProps = {
  setLocale: uiActions.setLocale
}

export default connect(mapStateToProps, mapDispatchToProps)(LocaleSelector)
