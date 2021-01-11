import React, { Component } from 'react'
import Draggable from 'react-draggable'

import Icon from '../narrative/icon'

const noop = () => {}

export default class DraggableWindow extends Component {
  render () {
    const {children, draggableProps, header, style} = this.props
    const GREY_BORDER = '#777 1.3px solid'
    return (
      <Draggable
        handle='.handle'
        {...draggableProps}
        // axis='x'
        // grid={[25, 25]}
        // scale={1}
        // FIXME: Update position in store on drag?
        // onStart={this.handleStart}
        // onDrag={this.handleDrag}
        // onStop={this.handleStop}
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
              onClick={this.props.onClickClose}
              className='clear-button-formatting pull-right'>
              <Icon type='times' />
            </button>
            {header}
          </div>
          <div style={{
            height: '260px',
            margin: '0px 5px',
            overflowY: 'scroll'
          }}>
            {children}
          </div>
        </div>
      </Draggable>
    )
  }
}

DraggableWindow.defaultProps = {
  onClickClose: noop
}
