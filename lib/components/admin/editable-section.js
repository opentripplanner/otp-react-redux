import { Field, Form, Formik } from 'formik'
import React, {Component} from 'react'

import {
  Button,
  Para,
  Val
} from './styled'

/**
 * This component will render a set of fields along with a 'Change/Edit' button
 * that toggles an editable state. In its editable state, the fields/values are
 * rendered as form inputs, which can be edited and then saved/persisted.
 */
export default class EditableSection extends Component {
  state = {
    isEditing: false
  }

  _exists = (val) => val !== null && typeof val !== 'undefined'

  _getVal = (fieldName) => this._exists(this.props.request[fieldName])
    ? this.props.request[fieldName]
    : ''

  _onClickSave = data => {
    const {intl, onChange, request} = this.props
    // Convert all null values received to '',
    // otherwise they will appear in the backend as the 'null' string.
    for (const field in data) {
      if (data[field] === null) data[field] = ''
    }

    onChange(request, data, intl)
    this.setState({isEditing: false})
  }

  _toggleEditing = () => {
    this.setState({isEditing: !this.state.isEditing})
  }

  render () {
    const {children, fields, inputStyle, request, valueFirst} = this.props
    const {isEditing} = this.state
    if (!request) return null
    return (
      <Formik
        // Force Formik to reload initialValues when we update them.
        enableReinitialize
        initialValues={request}
        onSubmit={this._onClickSave}
      >
        {
          formikProps => (
            <Form>
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
                      disabled={!formikProps.dirty}
                      type='submit'
                    >
                      Save
                    </Button>
                  </>
                }
              </span>
              {fields.map(f => {
                const input = (
                  <InputToggle
                    fieldName={f.fieldName}
                    inputProps={f.inputProps}
                    isEditing={isEditing}
                    key={f.fieldName}
                    options={f.options}
                    style={inputStyle}
                    value={this._getVal(f.fieldName)} />
                )
                return (
                  <Para key={f.fieldName}>
                    {valueFirst
                      ? <>{input} {f.label}</>
                      : <>{f.label}: {input}</>
                    }
                  </Para>
                )
              })}
            </Form>
          )
        }
      </Formik>
    )
  }
}

/**
 * This component renders either the specified value for a given field or, if
 * in an active editing state, the associated field's respective input (e.g.
 * text, number, or select).
 */
class InputToggle extends Component {
  render () {
    const {fieldName, inputProps, isEditing, options, style, value} = this.props
    if (isEditing) {
      if (options) {
        return (
          <Field
            as='select'
            name={fieldName}
          >
            {Object.keys(options).map(k =>
              <option value={k}>{options[k]}</option>
            )}
          </Field>
        )
      } else {
        return <Field
          {...inputProps}
          name={fieldName}
          style={style}
        />
      }
    }
    return <Val>{options ? options[value] : value}</Val>
  }
}
