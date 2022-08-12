import { Modal } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useEffect } from 'react'

type Props = {
  content?: {
    appendLocale?: boolean
    id?: string
    iframe?: boolean
    url?: string
  }
  hideModal: () => void
}

const isMobile = coreUtils.ui.isMobile()

/**
 * This component renders a bootstrap modal featuring a URL passed in via a content object.
 * On mobile, the link is opened in a popup window.
 *
 * The modal is automatically shown once a valid URL is passed. A callback is provided for when
 * the modal is closed by clicking on the background.
 */
const PopupWrapper = ({ content, hideModal }: Props): JSX.Element | null => {
  const intl = useIntl()

  const { appendLocale, id, iframe, url } = content || {}
  const shown = !!url

  const useIframe = !isMobile && iframe

  // appendLocale is true by default, so undefined is true
  const compiledUrl = `${url}${
    appendLocale !== false ? intl.defaultLocale : ''
  }`

  useEffect(() => {
    if (!useIframe && shown) {
      window.open(compiledUrl, '_blank')
    }
  }, [compiledUrl, useIframe, shown])

  if (!compiledUrl || !useIframe) return null

  return (
    <Modal dialogClassName="fullscreen-modal" onHide={hideModal} show={shown}>
      <iframe
        src={compiledUrl}
        title={intl.formatMessage({ id: `config.popups.${id}` })}
      />
    </Modal>
  )
}

export default PopupWrapper
