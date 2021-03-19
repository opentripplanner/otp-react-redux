import React, { Component } from 'react'
import Draggable from 'react-draggable'

import Icon from '../narrative/icon'

const noop = () => {}

export default class DraggableWindow extends Component {
  render () {
    const {
      children,
      draggableProps,
      footer,
      header,
      height = '245px',
      onClickClose,
      style
    } = this.props
    const GREY_BORDER = '#777 1.3px solid'
    return (
      <Draggable
        // Prevent dragging when clicking inside an input (e.g., search bar)
        cancel='input'
        handle='.handle'
        {...draggableProps}
      >
        <div
          style={{
            backgroundColor: 'white',
            border: GREY_BORDER,
            borderRadius: '5%',
            boxShadow: '2px 2px 8px',
            paddingBottom: '10px',
            position: 'absolute',
            width: '350px',
            zIndex: 9999999,
            ...style
          }}
        >
          <div
            className='handle'
            style={{
              borderBottom: GREY_BORDER,
              cursor: 'move',
              padding: '5px'
            }}
          >
            <button
              className='clear-button-formatting pull-right'
              onClick={onClickClose}
              style={{margin: '4px 4px 0 0'}}
            >
              <Icon type='times' />
            </button>
            {header}
          </div>
          <div style={{
            height,
            margin: '0px 5px',
            overflowY: 'scroll'
          }}>
            {children}
          </div>
          {footer &&
            <div
              className='window-footer'
              style={{
                borderTop: GREY_BORDER,
                padding: '5px'
              }}
            >
              {footer}
            </div>
          }
        </div>
      </Draggable>
    )
  }
}

DraggableWindow.defaultProps = {
  onClickClose: noop
}
