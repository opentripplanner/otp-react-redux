import flatten from 'flat'
import merge from 'deepmerge'

// Vite-specific glob import of all i18n YML content in OTP-RR and @opentripplanner packages.
// This module only contains code that depends on the below imports, so that other code can run jest.
const i18nModules = import.meta.glob('../../i18n/*.yml', { import: 'default' })
const i18nOtpUiModules = import.meta.glob(
  '../../node_modules/@opentripplanner/**/i18n/*.yml',
  { import: 'default' }
)

/**
 * Loads and merge all localized strings from known @opentripplanner packages that have translations.
 */
async function loadOtpUiLocaleData(matchedLocale) {
  const fileEnding = `/i18n/${matchedLocale}.yml`
  const otpUiMessages = await Promise.all(
    // Retain OTP-UI i18n content for the specified locale
    Object.keys(i18nOtpUiModules)
      .filter((key) => key.endsWith(fileEnding))
      .map(async (key) => i18nOtpUiModules[key]())
  )
  return merge.all(otpUiMessages)
}

/*
 * Load the localized strings for all languages here,
 * merge with the provided customized strings from state.otp.config.language
 * (overrides can be defined per language or for all languages)
 * and flatten to a map of
 *   id => string.
 * Languages are lazily-loaded by virtue of the Vite glob imports above.
 */
export async function loadLocaleData(matchedLocale, customMessages) {
  // If only 'zh' is configured and no other Chinese subset is, use Chinese Simplified.
  const loadedLocale = matchedLocale === 'zh' ? 'zh-Hans' : matchedLocale

  const messages = await i18nModules[`../../i18n/${loadedLocale}.yml`]()
  const otpUiMessages = await loadOtpUiLocaleData(loadedLocale)

  const mergedMessages = {
    ...flatten(otpUiMessages),
    ...flatten(messages),
    // Override the predefined strings with the custom ones, if any provided.
    ...flatten(customMessages.allLanguages || {}),
    ...flatten(customMessages[matchedLocale] || {})
  }

  return mergedMessages
}
