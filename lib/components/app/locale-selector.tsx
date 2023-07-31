import { connect } from 'react-redux'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { useIntl } from 'react-intl'
import React from 'react'

import * as uiActions from '../../actions/ui'
import { Dropdown } from '../util/dropdown'
import { getLanguageOptions } from '../../util/i18n'
import { UnstyledButton } from '../util/unstyled-button'

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
    <li>
      <Dropdown
        id="locale-selector"
        label={intl.formatMessage({ id: 'components.SubNav.selectALanguage' })}
        listLabel={intl.formatMessage({ id: 'components.SubNav.languages' })}
        name={<GlobeAmericas />}
        style={{ display: 'block ruby' }}
      >
        {Object.keys(languageOptions).map((locale: string) => (
          <li key={locale} lang={locale}>
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
    </li>
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
