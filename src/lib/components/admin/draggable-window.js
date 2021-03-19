import React, { Component } from 'react'
import Draggable from 'react-draggable'

import Icon from '../narrative/icon'

const noop = () => {}

export default class DraggableWindow extends Component {
  render () {
    const {children, draggableProps, header} = this.props
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
            position: 'absolute',
            zIndex: 9999999,
            width: '350px',
            backgroundColor: 'white',
            borderRadius: '5%',
            padding: '10px',
            boxShadow: '2px 2px 8px',
            border: GREY_BORDER
          }}
        >
          <div
            className='handle'
            style={{
              borderBottom: GREY_BORDER,
              cursor: 'move',
              fontSize: 'large',
              paddingBottom: '5px'
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
            height: '275px',
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
