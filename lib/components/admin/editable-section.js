import React, {Component} from 'react'

import {
  Button,
  P,
  Val
} from './styled'

/**
 * This component will render a set of fields along with a 'Change/Edit' button
 * that toggles an editable state. In its editable state, the fields/values are
 * rendered as form inputs, which can be edited and then saved/persisted.
 */
export default class EditableSection extends Component {
  state = {
    data: {},
    isEditing: false
  }

  _exists = (val) => val !== null && typeof val !== 'undefined'

  _getVal = (fieldName) => this._exists(this.state.data[fieldName])
    ? this.state.data[fieldName]
    : this._exists(this.props.request[fieldName])
      ? this.props.request[fieldName]
      : ''

  _onChange = (fieldName, value) => {
    const stateUpdate = this.state.data
    stateUpdate[fieldName] = value
    this.setState({data: stateUpdate})
  }

  _onClickSave = () => {
    const {request, onChange} = this.props
    const data = {}
    this.props.fields.forEach(f => {
      data[f.fieldName] = this._getVal(f.fieldName)
    })
    onChange(request, data)
    this.setState({data: {}, isEditing: false})
  }

  _toggleEditing = () => {
    const stateUpdate = {isEditing: !this.state.isEditing}
    if (this.state.isEditing) {
      stateUpdate.data = {}
    }
    this.setState(stateUpdate)
  }

  render () {
    const {fields, children, inputStyle, request, valueFirst} = this.props
    const {isEditing} = this.state
    if (!request) return null
    return (
      <>
        {children}
        <span
          className='pull-right'
          // Limit height so that it does not collide with form elements
          // below when actively editing.
          style={{height: '10px', marginRight: '15px'}}
        >
          {!isEditing
            ? <Button
              bsSize='xsmall'
              onClick={this._toggleEditing}
            >
              Change
            </Button>
            : <>
              <Button
                bsSize='xsmall'
                bsStyle='link'
                onClick={this._toggleEditing}
              >
                Cancel
              </Button>
              <Button
                bsSize='xsmall'
                bsStyle='link'
                disabled={Object.keys(this.state.data).length === 0}
                onClick={this._onClickSave}
              >
                Save
              </Button>
            </>
          }
        </span>
        {fields.map(f => {
          const input = (
            <InputToggle
              inputProps={f.inputProps}
              isEditing={isEditing}
              fieldName={f.fieldName}
              onChange={this._onChange}
              options={f.options}
              style={inputStyle}
              value={this._getVal(f.fieldName)} />
          )
          return (
            <P key={f.fieldName}>
              {valueFirst
                ? <>{input} {f.label}</>
                : <>{f.label}: {input}</>
              }
            </P>
          )
        })}
      </>
    )
  }
}

/**
 * This component renders either the specified value for a given field or, if
 * in an active editing state, the associated field's respective input (e.g.
 * text, number, or select).
 */
class InputToggle extends Component {
  _onChange = (evt) => {
    const {fieldName, inputProps = {}, onChange} = this.props
    let value = evt.target.value
    if (inputProps.type === 'number') {
      value = +evt.target.value
    }
    onChange(fieldName, value)
  }
  render () {
    const {inputProps, fieldName, isEditing, options, style, value} = this.props
    if (isEditing) {
      if (options) {
        return (
          <select onBlur={this._onChange} onChange={this._onChange}>
            {Object.keys(options).map(k =>
              <option selected={k === value} value={k}>{options[k]}</option>
            )}
          </select>
        )
      } else {
        return <input
          {...inputProps}
          name={fieldName}
          onChange={this._onChange}
          style={style}
          value={value}
        />
      }
    }
    return <Val>{options ? options[value] : value}</Val>
  }
}
