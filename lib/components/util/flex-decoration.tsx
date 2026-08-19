import React, { ReactElement, useContext } from 'react'

import { ComponentContext } from '../../util/contexts'

/**
 * For presentation only, to add a visual cue to a mode icon,
 * for instance adding an asterisk next to a bus icon to indicate a service with reservation.
 * Other parts of the UI already have text about reservations required.
 */
export default function FlexDecoration(): ReactElement {
  // @ts-expect-error No type on ComponentContext
  const { FlexNoticeIcon } = useContext(ComponentContext)
  return (
    <span aria-hidden style={{ marginLeft: '-10px' }}>
      <FlexNoticeIcon />
    </span>
  )
}
