import { Modal } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useEffect } from 'react'

import { StyledIconWrapper } from '../util/styledIcon'
import { Times } from '@styled-icons/fa-solid'
import PageTitle from '../util/page-title'

import styled from 'styled-components'

type Props = {
  content?: {
    appendLocale?: boolean
    id?: string
    modal?: boolean
    url?: string
  }
  hideModal: () => void
}

const CloseModalButton = styled.button`
  &.close-button {
    padding: 0.25em;
    right: 0.75em;
    top: 0.5em;
  }
`

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

  const { appendLocale, id, modal, url } = content || {}

  const closeText = intl.formatMessage({ id: 'common.forms.close' })

  const useIframe = !isMobile && modal
  const shown = !!url

  // appendLocale is true by default, so undefined is true
  const compiledUrl = `${url}${
    appendLocale !== false ? intl.defaultLocale : ''
  }`

  useEffect(() => {
    if (!useIframe && shown) {
      window.open(compiledUrl, '_blank')
      hideModal()
    }
  }, [compiledUrl, hideModal, useIframe, shown])

  if (!compiledUrl || !useIframe) return null

  const title = intl.formatMessage({ id: `config.popups.${id}` })

  /* HACK: Since Bootstrap 3.x does not support adding id or name to navItem, 
  we have to grab a list of all navItems by className and find the correct button.
  Since the sliding pane "Leave Feedback" button will always be in the DOM after
  the navbar button, reverse + find should always find the correct button to return to. */

  const navItemList = Array.from(
    document.getElementsByClassName('navItem')
  ).reverse() as HTMLElement[]
  const focusElement = navItemList.find((el) => el.innerText === title)

  const closeModal = () => {
    hideModal()
    focusElement?.focus()
  }

  return (
    <Modal
      aria-label={title}
      dialogClassName="fullscreen-modal"
      onEscapeKeyDown={closeModal}
      onHide={closeModal}
      role="presentation"
      show={shown}
    >
      <CloseModalButton
        aria-label={closeText}
        className="clear-button-formatting close-button"
        onClick={closeModal}
        title={closeText}
      >
        <StyledIconWrapper>
          <Times />
        </StyledIconWrapper>
      </CloseModalButton>
      <PageTitle title={title} />
      <iframe src={compiledUrl} title={title} />
    </Modal>
  )
}

export default PopupWrapper
