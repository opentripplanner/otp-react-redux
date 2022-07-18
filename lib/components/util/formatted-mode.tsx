import { useIntl } from 'react-intl'
import React, { ReactElement } from 'react'

import { getFormattedMode } from '../../util/i18n'

interface Props {
  mode: string
}

/**
 * JSX wrapper for the i18n.getFormattedMode function (renders into a React fragment).
 */
const FormattedMode = ({ mode = '' }: Props): ReactElement => {
  const intl = useIntl()
  return <>{getFormattedMode(mode, intl)}</>
}

export default FormattedMode
