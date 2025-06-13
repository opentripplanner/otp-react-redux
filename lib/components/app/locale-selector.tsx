import { connect } from 'react-redux'
import { Dropdown } from '@opentripplanner/building-blocks'
import { FormattedMessage, useIntl } from 'react-intl'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import React from 'react'

import * as uiActions from '../../actions/ui'
import { getLanguageOptions } from '../../util/i18n'
import { UnstyledButton } from '../util/unstyled-button'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

interface LocaleSelectorProps {
  // Typescript TODO languageOptions based on configLanguage type.
  languageOptions: Record<string, any> | null
  locale: string
  setLocale: (locale: string, isUpdatingLocale: boolean) => void
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element | null => {
  const { languageOptions, locale: currentLocale, setLocale } = props
  const intl = useIntl()

  // Only render if two or more languages are configured.
  return languageOptions ? (
    <li>
      <Dropdown
        className="navBarItem"
        id="locale-selector"
        label={intl.formatMessage({ id: 'components.SubNav.selectALanguage' })}
        listLabel={intl.formatMessage({ id: 'components.SubNav.languages' })}
        style={{ display: 'block ruby' }}
        text={<GlobeAmericas />}
      >
        {Object.keys(languageOptions).map((locale: string) => (
          <li key={locale} lang={locale}>
            <UnstyledButton
              aria-selected={locale === currentLocale || undefined}
              onClick={() => setLocale(locale, true)}
              role="option"
            >
              {languageOptions[locale].name}
              {locale === currentLocale && (
                <InvisibleA11yLabel>
                  <FormattedMessage id="common.currentlySelected" />
                </InvisibleA11yLabel>
              )}
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
