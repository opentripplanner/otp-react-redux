import React, {Component} from 'react'
import {Badge, Button} from 'react-bootstrap'
import {connect} from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import Icon from '../narrative/icon'
import {getModuleConfig, isModuleEnabled, Modules} from '../../util/config'
import {createLetter, LETTER_FIELDS} from '../../util/mailables'

import {MailablesList, WindowHeader} from './styled'
import DraggableWindow from './draggable-window'

/**
 * A window enabled through the Mailables module that allows Call Taker users
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
    if (!this.state.mailables.find(m => m.name === mailable.name)) {
      const mailables = [...this.state.mailables]
      mailables.push({...mailable, quantity: 1})
      this.setState({mailables})
    }
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

  _onClickCreateLetter = () => createLetter(this.state, this.props.mailablesConfig)

  _updateLetterField = (evt) => {
    this.setState({[evt.target.id]: evt.target.value})
  }

  render () {
    const {mailablesConfig, mailablesEnabled, callTaker, toggleMailables} = this.props
    if (!mailablesEnabled) return null
    const {mailables: selectedMailables} = this.state
    const {items} = mailablesConfig
    if (!callTaker.mailables.visible) return null
    const selectableMailables = items.filter(m =>
      !selectedMailables.find(mailable => mailable.name === m.name)
    )
    const MAILABLE_WIDTH = 300
    return (
      <DraggableWindow
        footer={
          <>
            <span className='pull-right'>
              <Button
                bsSize='xsmall'
                onClick={this._onClickCreateLetter}
                style={{marginRight: '5px', verticalAlign: 'bottom'}}
              >
                Create Letter
              </Button>
            </span>
          </>
        }
        header={
          <>
            <WindowHeader>
              <Icon type='envelope' /> Mailables{' '}
            </WindowHeader>
          </>
        }
        height='300px'
        onClickClose={toggleMailables}
        scroll={false}
        style={{width: MAILABLE_WIDTH * 2}}
      >
        <div>
          <h4>Customer Address</h4>
          {LETTER_FIELDS.map((row, r) => (
            <div key={r}>
              {row.map(f => (
                <input
                  key={f.fieldName}
                  id={f.fieldName}
                  onChange={this._updateLetterField}
                  placeholder={f.placeholder}
                  style={{margin: '5px'}}
                  value={this.state[f.fieldName]} />
              ))}
            </div>
          ))}
        </div>
        <div style={{display: 'flex'}}>
          <div style={{width: MAILABLE_WIDTH}}>
            <h4>All Mailables</h4>
            <MailablesList>
              {selectableMailables.map(mailable => (
                <MailableOption
                  key={mailable.name}
                  mailable={mailable}
                  onClick={this._addMailable} />
              ))}
            </MailablesList>
          </div>
          <div style={{width: MAILABLE_WIDTH}}>
            <h4>Selected Mailables <Badge>{selectedMailables.length}</Badge></h4>
            <MailablesList>
              {selectedMailables.length > 0
                ? selectedMailables.map((mailable, i) => (
                  <MailableOption
                    index={i}
                    key={mailable.name}
                    mailable={mailable}
                    onRemove={this._removeMailable}
                    updateField={this._updateMailableField} />
                ))
                : <div className='text-muted'>No mailables selected.</div>
              }
            </MailablesList>
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

  _onRemove = () => this.props.onRemove && this.props.onRemove(this.props.mailable)

  _onClick = () => this.props.onClick && this.props.onClick(this.props.mailable)

  render () {
    const {mailable, onRemove} = this.props
    const isSelected = Boolean(onRemove)
    const containerStyle = {
      backgroundColor: '#eaeaea',
      display: 'block',
      margin: '2px 0px',
      maxWidth: '290px',
      padding: '3px 0px',
      width: '100%'
    }
    const label = (
      <div className='overflow-ellipsis' title={mailable.name}>
        {mailable.name}
      </div>
    )
    if (isSelected) {
      return (
        <div style={containerStyle}>
          {label}
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
            <Button
              className='pull-right'
              bsStyle='link'
              onClick={this._onRemove}
              title='Remove item'
            >
              <Icon type='close' />
            </Button>
          </div>
        </div>
      )
    }
    return (
      <button
        className='clear-button-formatting'
        onClick={this._onClick}
        style={containerStyle}
      >
        {label}
      </button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    mailablesConfig: getModuleConfig(state, Modules.MAILABLES),
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES)
  }
}

const mapDispatchToProps = {
  toggleMailables: callTakerActions.toggleMailables
}

export default connect(mapStateToProps, mapDispatchToProps)(MailablesWindow)
