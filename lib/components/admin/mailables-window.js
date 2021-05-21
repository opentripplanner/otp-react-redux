import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'
import {WindowHeader} from './styled'
import {createLetter, MAILABLE_FIELDS} from '../../util/mailables'

/**
 * A window enabled through the Call Taker module that allows Call Taker users
 * to generate a PDF with an invoice of items to be mailed to transit customers.
 */
class MailablesWindow extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mailables: []
    }
  }

  _addMailable = (mailable) => {
    const mailables = [...this.state.mailables]
    if (!mailables.find(m => m.name === mailable.name)) {
      mailables.push({...mailable, quantity: 1})
    } else {
      // FIXME: Increase quanity?
    }
    this.setState({mailables})
  }

  _removeMailable = (mailable) => {
    const mailables = [...this.state.mailables]
    const removeIndex = mailables.findIndex(m => m.name === mailable.name)
    mailables.splice(removeIndex, 1)
    this.setState({mailables})
  }

  _updateMailableField = (index, fieldName, value) => {
    const mailables = [...this.state.mailables]
    mailables[index] = {...mailables[index], [fieldName]: value}
    this.setState({mailables})
  }

  _onClickCreateLetter = () => createLetter(this.state, this.props.callConfig.options)

  _updateField = (evt) => {
    this.setState({[evt.target.id]: evt.target.value})
  }

  render () {
    const {callConfig, callTaker, toggleMailables} = this.props
    const {mailables: selectedMailables} = this.state
    const {mailables} = callConfig.options
    if (!callTaker.mailables.visible) return null
    const selectableMailables = mailables.filter(m => !selectedMailables.find(mailable => mailable.name === m.name))
    return (
      <DraggableWindow
        header={
          <>
            <WindowHeader>
              <Icon type='graduation-cap' /> Mailables{' '}
              <span className='pull-right'>
                <button
                  className='clear-button-formatting'
                  onClick={this._onClickCreateLetter}
                  style={{marginRight: '5px', verticalAlign: 'bottom'}}
                >
                  Create Letter
                </button>
              </span>
            </WindowHeader>
          </>
        }
        onClickClose={toggleMailables}
        scroll={false}
        style={{width: '600px'}}
      >
        <div>
          {MAILABLE_FIELDS.map(f => (
            <input
              key={f.fieldName}
              id={f.fieldName}
              onChange={this._updateField}
              placeholder={f.fieldName}
              value={this.state[f.fieldName]} />
          ))}
        </div>
        <div style={{display: 'flex'}}>
          <div style={{width: '300px'}}>
            <h4>All Mailables</h4>
            <div style={{maxHeight: '120px', overflowY: 'scroll'}}>
              {selectableMailables.map((mailable, i) => (
                <MailableOption
                  key={mailable.name}
                  mailable={mailable}
                  onClick={this._addMailable} />
              ))}
            </div>
          </div>
          <div style={{width: '300px'}}>
            <h4>Selected Mailables</h4>
            <div style={{maxHeight: '120px', overflowY: 'scroll'}}>
              {selectedMailables.length > 0
                ? selectedMailables.map((mailable, i) => (
                  <MailableOption
                    index={i}
                    key={mailable.name}
                    mailable={mailable}
                    onClear={this._removeMailable}
                    updateField={this._updateMailableField} />
                ))
                : <div className='text-muted'>No mailables selected.</div>
              }
            </div>
          </div>
        </div>
      </DraggableWindow>
    )
  }
}

class MailableOption extends Component {
  _changeLargeFormat = (evt) => {
    const {index, updateField} = this.props
    updateField(index, 'largeFormat', evt.target.checked)
  }

  _changeQuantity = (evt) => {
    const {index, updateField} = this.props
    updateField(index, 'quantity', evt.target.value)
  }

  _onClear = () => this.props.onClear && this.props.onClear(this.props.mailable)

  _onClick = () => this.props.onClick && this.props.onClick(this.props.mailable)

  render () {
    const {mailable, onClear} = this.props
    const isSelected = Boolean(onClear)
    if (isSelected) {
      return (
        <div>
          {mailable.name}
          <button className='pull-right clear-button-formatting' onClick={onClear}>
            x
          </button>
          <div>
            <input
              min={0}
              onChange={this._changeQuantity}
              step={1}
              style={{marginRight: '5px', width: '50px'}}
              type='number'
              value={mailable.quantity} />
            {mailable.largePrint &&
              <>
                <input
                  id='largeFormat'
                  onChange={this._changeLargeFormat}
                  type='checkbox'
                  value={mailable.largeFormat} />
                <label style={{marginLeft: '5px'}} htmlFor='largeFormat'>
                  Large format?
                </label>
              </>
            }
          </div>
        </div>
      )
    }
    return (
      <button className='clear-button-formatting' onClick={this._onClick}>
        {mailable.name}
      </button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const callConfig = state.otp.config.modules.find(m => m.id === 'call')
  return {
    callConfig,
    callTaker: state.callTaker
  }
}

const mapDispatchToProps = {
  toggleMailables: callTakerActions.toggleMailables
}

export default connect(mapStateToProps, mapDispatchToProps)(MailablesWindow)
