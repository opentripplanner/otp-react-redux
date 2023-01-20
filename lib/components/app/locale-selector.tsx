import { connect, ConnectedProps } from 'react-redux'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { useIntl } from 'react-intl'
import React, { MouseEvent } from 'react'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { StyledIconWrapper } from '../util/styledIcon'
import { UnstyledButton } from '../util/unstyled-button'
import Dropdown from '../util/dropdown'

type PropsFromRedux = ConnectedProps<typeof connector>

interface LocaleSelectorProps extends PropsFromRedux {
  // Typescript TODO configLanguageType
  configLanguages: Record<string, any>
}

const LocaleSelector = (props: LocaleSelectorProps): JSX.Element => {
  const { configLanguages, locale: currentLocale, setLocale } = props

  const intl = useIntl()

  return (
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
      {Object.keys(configLanguages)
        .filter((locale) => locale !== 'allLanguages')
        .map((locale) => (
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
              {configLanguages[locale].name}
            </UnstyledButton>
          </li>
        ))}
    </Dropdown>
  )
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

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(LocaleSelector)
