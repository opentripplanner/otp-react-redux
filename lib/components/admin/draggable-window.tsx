import { Times } from '@styled-icons/fa-solid/Times'
import Draggable, { DraggableProps } from 'react-draggable'
import React, { HTMLAttributes, ReactNode } from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

interface Props extends HTMLAttributes<HTMLDivElement> {
  draggableProps?: DraggableProps
  footer?: ReactNode
  header?: ReactNode
  height?: string
  onClickClose?: () => null
  scroll?: boolean
}

export default function DraggableWindow({
  children,
  draggableProps,
  footer,
  header,
  height = '245px',
  onClickClose = () => null,
  scroll = true,
  style
}: Props): React.ReactElement {
  const GREY_BORDER = '#777 1.3px solid'
  const overwrittenDraggableProps = {
    ...draggableProps,
    cancel: 'input',
    handle: '.handle'
  }
  return (
    <Draggable
      // Prevent dragging when clicking inside an input (e.g., search bar)
      {...overwrittenDraggableProps}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: GREY_BORDER,
          borderRadius: '15px',
          boxShadow: '0 0 8px',
          paddingBottom: '10px',
          position: 'absolute',
          width: '350px',
          zIndex: 9999999,
          ...style
        }}
      >
        <div
          className="handle"
          style={{
            borderBottom: GREY_BORDER,
            cursor: 'move',
            padding: '5px'
          }}
        >
          <button
            className="clear-button-formatting pull-right"
            onClick={onClickClose}
            style={{ margin: '4px 4px 0 0' }}
          >
            <StyledIconWrapper>
              <Times />
            </StyledIconWrapper>
          </button>
          {header}
        </div>
        <div
          style={{
            height,
            margin: '0px 5px',
            overflowY: scroll ? 'scroll' : 'visible'
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="window-footer"
            style={{
              borderTop: GREY_BORDER,
              padding: '5px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </Draggable>
  )
}
