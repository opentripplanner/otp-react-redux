/* eslint-disable react/prop-types */
import { Badge, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-solid/Envelope'
import React, { Component } from 'react'

import * as callTakerActions from '../../actions/call-taker'
import { createLetter, LETTER_FIELDS } from '../../util/mailables'
import { getModuleConfig, isModuleEnabled, Modules } from '../../util/config'
import { IconWithText } from '../util/styledIcon'

import {
  MailablesList,
  SelectableMailableButton,
  SelectedMailableContainer,
  SelectedMailableOptionsContainer,
  WindowHeader
} from './styled'
import DraggableWindow from './draggable-window'

function MailableLabel({ mailable }) {
  return (
    <div className="overflow-ellipsis" title={mailable.name}>
      {mailable.name}
    </div>
  )
}

class SelectableMailable extends Component {
  _onClick = () => this.props.onClick(this.props.mailable)

  render() {
    const { mailable } = this.props
    return (
      <SelectableMailableButton
        className="clear-button-formatting"
        onClick={this._onClick}
      >
        <MailableLabel mailable={mailable} />
      </SelectableMailableButton>
    )
  }
}

class SelectedMailable extends Component {
  _changeLargeFormat = (evt) => {
    const { index, updateField } = this.props
    updateField(index, 'largeFormat', evt.target.checked)
  }

  _changeQuantity = (evt) => {
    const { index, updateField } = this.props
    updateField(index, 'quantity', evt.target.value)
  }

  _onRemove = () => this.props.onRemove(this.props.mailable)

  render() {
    const { index, mailable } = this.props
    const id = `largeFormat-${index}`
    return (
      <SelectedMailableContainer>
        <MailableLabel mailable={mailable} />
        <SelectedMailableOptionsContainer>
          <input
            min={0}
            onChange={this._changeQuantity}
            step={1}
            style={{ marginRight: '5px', width: '50px' }}
            type="number"
            value={mailable.quantity}
          />
          {mailable.largePrint && (
            <div style={{ marginTop: '5px' }}>
              <input
                id={id}
                onChange={this._changeLargeFormat}
                type="checkbox"
                value={mailable.largeFormat}
              />
              <label htmlFor={id} style={{ marginLeft: '5px' }}>
                Large format?
              </label>
            </div>
          )}
          <Button bsStyle="link" onClick={this._onRemove}>
            Remove
          </Button>
        </SelectedMailableOptionsContainer>
      </SelectedMailableContainer>
    )
  }
}

/**
 * A window enabled through the Mailables module that allows Call Taker users
 * to generate a PDF with an invoice of items to be mailed to transit customers.
 */
class MailablesWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mailables: []
    }
  }

  _addMailable = (mailable) => {
    const mailables = [...this.state.mailables]
    mailables.push({ ...mailable, quantity: 1 })
    this.setState({ mailables })
  }

  _removeMailable = (mailable) => {
    const mailables = [...this.state.mailables]
    const removeIndex = mailables.findIndex((m) => m.name === mailable.name)
    mailables.splice(removeIndex, 1)
    this.setState({ mailables })
  }

  _updateMailableField = (index, fieldName, value) => {
    const mailables = [...this.state.mailables]
    mailables[index] = { ...mailables[index], [fieldName]: value }
    this.setState({ mailables })
  }

  _onClickCreateLetter = () =>
    createLetter(this.state, this.props.mailablesConfig)

  _updateLetterField = (evt) => {
    this.setState({ [evt.target.id]: evt.target.value })
  }

  render() {
    const { callTaker, mailablesConfig, mailablesEnabled, toggleMailables } =
      this.props
    if (!mailablesEnabled) return null
    const { mailables: selectedMailables } = this.state
    const { items } = mailablesConfig
    if (!callTaker.mailables.visible) return null
    // If items should not be addable twice, then this line can be amended
    const selectableMailables = items

    return (
      <DraggableWindow
        footer={
          <Button
            bsSize="xsmall"
            className="pull-right"
            onClick={this._onClickCreateLetter}
            style={{ marginRight: '5px', verticalAlign: 'bottom' }}
          >
            Create Letter
          </Button>
        }
        header={
          <WindowHeader>
            <IconWithText Icon={Envelope}>Mailables</IconWithText>
          </WindowHeader>
        }
        height="300px"
        onClickClose={toggleMailables}
        scroll={false}
        style={{ width: '600px' }}
      >
        <div>
          <h4>Customer Address</h4>
          {LETTER_FIELDS.map((row, r) => (
            <div key={r}>
              {row.map((f) => (
                <input
                  id={f.fieldName}
                  key={f.fieldName}
                  onChange={this._updateLetterField}
                  placeholder={f.placeholder}
                  style={{ margin: '5px' }}
                  value={this.state[f.fieldName]}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <h4
              // Styling hack: extra pixel of padding so that the element height
              // matches the mirroring h4 that has a badge (which increases its
              // height ever so slightly).
              style={{ paddingBottom: '1px' }}
            >
              All Mailables
            </h4>
            <MailablesList>
              {selectableMailables.map((mailable) => (
                <SelectableMailable
                  key={mailable.name}
                  mailable={mailable}
                  onClick={this._addMailable}
                />
              ))}
            </MailablesList>
          </div>
          <div style={{ width: '50%' }}>
            <h4>
              Selected Mailables <Badge>{selectedMailables.length}</Badge>
            </h4>
            <MailablesList>
              {selectedMailables.length > 0 ? (
                selectedMailables.map((mailable, i) => (
                  <SelectedMailable
                    index={i}
                    key={mailable.name}
                    mailable={mailable}
                    onRemove={this._removeMailable}
                    updateField={this._updateMailableField}
                  />
                ))
              ) : (
                <div className="text-muted">No mailables selected.</div>
              )}
            </MailablesList>
          </div>
        </div>
      </DraggableWindow>
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
