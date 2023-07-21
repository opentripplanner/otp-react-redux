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
import React, { useCallback, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { StyledDateTimePreview } from './batch-styled'
import DateTimeModal from './date-time-modal'

const defaultAccentColor = '#666'
const defaultActiveHoverColor = '#333'

const boxShadowCss = css`
  box-shadow: rgba(0, 0, 0, 0.1) 0 0 20px;
`

const ButtonWrapper = styled.span`
  position: relative;

  & > button {
    /* background: #fff; */
    border-radius: 5px;
    border: none;
    /* border: 2px solid ${defaultAccentColor}; */
    cursor: pointer;
    height: 51px;
    transition: all 250ms cubic-bezier(0.27, 0.01, 0.38, 1.06);
  }

  & > button:hover {
    background: #ddd;
    border-color: ${defaultActiveHoverColor};
    ${boxShadowCss}
  }

  & > input:focus + label {
    outline: 5px auto blue;
    /* This next line enhances the visuals in Chromium (webkit) browsers */
    outline: 5px auto -webkit-focus-ring-color;
    /* Render the focus outline inside and distinct from the border for both Chrome and Firefox. */
    outline-offset: -4px;
  }

  & > input:checked + label:hover {
    background: ${defaultActiveHoverColor};
  }
`

const HoverPanel = styled.div`
  padding: 0 10px;
  width: 400px;
  z-index: 100;
`

const HoverInnerContainer = styled.div`
  background: #fff;
  border-radius: 4px;
  color: #2e2e2e;
  font-size: 90%;
  font-weight: bold;
  padding: 0px 20px 10px;
  pointer-events: none;
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

interface DateTimeButtonProps {
  id: string
  itemWithKeyboard?: string
  onPopupClose: () => void
  onPopupKeyboardExpand: (id: string) => void
  onToggle: () => void
}

/**
 * Button and popup component for the date & time selector.
 */
export default function DateTimeButton({
  id,
  itemWithKeyboard,
  onPopupClose,
  onPopupKeyboardExpand,
  onToggle
}: DateTimeButtonProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef(null)
  const onOpenChange = useCallback(
    (value) => {
      setOpen(value)
      if (!value && typeof onPopupClose === 'function') {
        onPopupClose()
      }
    },
    [onPopupClose, setOpen]
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
      // (This is to avoid focus being stolen by hovering out of another button.)
      enabled: itemWithKeyboard === null,
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

  const renderDropdown = open
  const interactionProps = getReferenceProps()

  const handleButtonClick = useCallback(
    (e) => {
      if (typeof onPopupKeyboardExpand === 'function') {
        onPopupKeyboardExpand(id)
      }
      if (typeof interactionProps.onClick === 'function') {
        interactionProps.onClick(e)
      }
    },
    [id, interactionProps, onPopupKeyboardExpand]
  )

  return (
    <ButtonWrapper>
      <button
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...interactionProps}
        // Separate handler to communicate to the parent element
        // which item had a popup triggered using the keyboard.
        onClick={handleButtonClick}
        // This will trigger mouse effects such as showing popup on hover of on check.
        ref={reference}
        // Required by linter settings
        type="button"
      >
        <StyledDateTimePreview hideButton />
        <InvisibleA11yLabel>Invis label text</InvisibleA11yLabel>
      </button>
      {renderDropdown && (
        <FloatingFocusManager
          context={context}
          // Restore the keyboard focus AND show focus cue on hovering out of the label
          // only if this component triggered the popup using the keyboard.
          // (Don't show focus cue if the popup was not triggered via keyboard.)
          returnFocus={itemWithKeyboard === id}
        >
          <HoverPanel
            // This library relies on prop spreading
            {...getFloatingProps()}
            // TODO: Matches ID on Header element in SubSettingsPane
            // aria-labelledby={`metro-mode-selector-${modeButton.key}-button-label`}
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
