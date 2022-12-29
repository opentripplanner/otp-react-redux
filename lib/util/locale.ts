import { IntlShape } from 'react-intl'
import { MouseEvent } from 'react'
import { User } from '@auth0/auth0-react'

export const handleLocaleSelection = (
  e: MouseEvent<Element>,
  locale: string,
  currentLocale: string,
  loggedInUser: User,
  createOrUpdateUser: (user: User, silent: boolean, intl: IntlShape) => void,
  setLocale: (locale: string) => void,
  intl: IntlShape
): void => {
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
