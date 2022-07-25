import { Modal } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useEffect } from 'react'

type Props = {
  appendLocale?: boolean
  content: string // TODO: URL TYPE?
  hideModal: () => void
}

/**
 * TODO JSDOC
 */
const PopupWrapper = ({
  appendLocale = true,
  content,
  hideModal
}: Props): JSX.Element | null => {
  const intl = useIntl()
  const shown = !!content

  const isMobile = coreUtils.ui.isMobile()
  const compiledUrl = `${content}${appendLocale && intl.defaultLocale}`

  useEffect(() => {
    if (isMobile) {
      window.open(compiledUrl)
    }
  }, [isMobile, compiledUrl])

  if (isMobile) return null

  return (
    <Modal
      dialogClassName="fullscreen-modal"
      onHide={() => {
        hideModal()
      }}
      show={shown}
    >
      <iframe
        src={compiledUrl}
        style={{ height: '100%', width: '100%' }}
        title="TODO: SET DYNAMICALLY BASED ON CONFIG"
      />
    </Modal>
  )
}

export default PopupWrapper
