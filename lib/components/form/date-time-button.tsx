import {
  arrow,
  FloatingFocusManager,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole
} from '@floating-ui/react'
import { FormattedMessage } from 'react-intl'
import React, { HTMLAttributes, useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { activeCss, boxShadowCss, buttonPixels } from './batch-styled'
import DateTimeModal from './date-time-modal'
import DateTimePreview from './date-time-preview'

const ButtonWrapper = styled.span`
  position: relative;

  & > button {
    background-color: var(--main-base-color, rgba(0, 0, 0, 0.5));
    border-radius: 5px;
    border: none;
    color: var(--main-color, white);
    cursor: pointer;
    font-size: 12px;
    height: ${buttonPixels}px;
    padding: 4px 5px;
    text-align: left;
    transition: all 250ms cubic-bezier(0.27, 0.01, 0.38, 1.06);
    white-space: nowrap;
    width: 120px;
  }

  & > button:hover,
  & > button[aria-expanded='true'] {
    ${activeCss}
    ${boxShadowCss}
  }

  /* Remove pointer events triggered by children of the button.
     (they interfere with the floating-ui hover interaction handler.) */
  & > button > * {
    pointer-events: none;
  }
`

const HoverPanel = styled.div`
  min-width: min(400px, 100vw);
  max-width: 100vw;
  padding: 0 10px;
  width: 33vw;
  z-index: 100;
`

// Ideally, import styles below from mode selector package.
const HoverInnerContainer = styled.div`
  background: #fff;
  border-radius: 4px;
  padding: 0px 20px 10px;
  ${boxShadowCss}
`

const Arrow = styled.div`
  background: #fff;
  height: 10px;
  margin-top: -5px;
  position: absolute;
  transform: rotate(-45deg);
  width: 10px;
  ${boxShadowCss}
`

interface DateTimeButtonProps extends HTMLAttributes<HTMLSpanElement> {
  open: boolean
  setOpen: (arg: boolean) => void
}

/**
 * Button and popup component for the date & time selector.
 */
export default function DateTimeButton({
  open,
  setOpen,
  style
}: DateTimeButtonProps): JSX.Element {
  const arrowRef = useRef(null)
  // State used to keep the popup open when triggered by keyboard while moving the mouse around.
  const [openWithKeyboard, setOpenWithKeyboard] = useState(false)
  const onOpenChange = useCallback(
    (value) => {
      setOpen(value)
      if (!value) {
        setOpenWithKeyboard(false)
      }
    },
    [setOpen, setOpenWithKeyboard]
  )
  const {
    context,
    floating,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    reference,
    strategy,
    x,
    y
  } = useFloating({
    middleware: [offset(8), shift(), arrow({ element: arrowRef })],
    onOpenChange,
    open
  })

  const { getFloatingProps, getReferenceProps } = useInteractions([
    useHover(context, {
      // Enable hover only if no popup has been triggered via keyboard.
      // (This keeps the keyboard-triggered popups open while moving mouse around.)
      enabled: !openWithKeyboard,
      handleClose: safePolygon({
        blockPointerEvents: false,
        buffer: 0,
        restMs: 500
      })
    }),
    useClick(context),
    useRole(context),
    useDismiss(context)
  ])

  const interactionProps = getReferenceProps()

  // ARIA roles are added by the `useRole` hook.
  // Remove the aria-controls, aria-expanded, and aria-haspopup props from the span, they will
  // instead be passed to the button for keyboard/screen reader users to trigger the popup.
  const {
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    ...spanInteractionProps
  } = interactionProps

  const handleButtonClick = useCallback(
    (e) => {
      setOpenWithKeyboard(true)
      if (typeof interactionProps.onClick === 'function') {
        interactionProps.onClick(e)
      }
    },
    [interactionProps]
  )

  return (
    <ButtonWrapper style={style}>
      <button
        {...interactionProps}
        id="date-time-button"
        // Separate handler to communicate to the parent element
        // which item had a popup triggered using the keyboard.
        onClick={handleButtonClick}
        // This will trigger mouse effects such as showing popup on hover of on check.
        ref={reference}
        // Required by linter settings
        type="button"
      >
        <InvisibleA11yLabel>
          <span id="date-time-settings-label">
            <FormattedMessage id="components.DateTimePreview.editDepartOrArrival" />
          </span>
          {' - '}
        </InvisibleA11yLabel>
        <span {...spanInteractionProps}>
          <DateTimePreview />
        </span>
      </button>
      {open && (
        <FloatingFocusManager
          context={context}
          // Restore the keyboard focus AND show focus cue on hovering out of the label
          // only if this component triggered the popup using the keyboard.
          // (Don't show focus cue if the popup was not triggered via keyboard.)
          returnFocus={openWithKeyboard}
        >
          <HoverPanel
            {...getFloatingProps()}
            aria-labelledby="date-time-settings-label"
            ref={floating}
            style={{
              left: x ?? 0,
              position: strategy,
              top: y ?? 0
            }}
          >
            <Arrow
              ref={arrowRef}
              style={{ left: arrowX ?? 0, top: arrowY ?? 0 }}
            />
            <HoverInnerContainer>
              <DateTimeModal />
            </HoverInnerContainer>
          </HoverPanel>
        </FloatingFocusManager>
      )}
    </ButtonWrapper>
  )
}
