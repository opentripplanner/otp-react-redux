import { getDateFormat } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as fieldTripActions from '../../actions/field-trip'
import DraggableWindow from './draggable-window'
import EditableSection from './editable-section'
import FieldTripNotes from './field-trip-notes'
import Icon from '../narrative/icon'
import {
  B,
  Button,
  Container,
  FullWithMargin,
  Half,
  Header,
  InlineHeader,
  P,
  Text
} from './styled'
import TripStatus from './trip-status'
import Updatable from './updatable'
import {getGroupSize} from '../../util/call-taker'

const TICKET_TYPES = {
  own_tickets: 'Will use own tickets',
  hop_new: 'Will purchase new Hop Card',
  hop_reload: 'Will reload existing Hop Card'
}
const PAYMENT_PREFS = {
  request_call: 'Call requested at provided phone number',
  phone_cc: 'Will call in credit card info to TriMet',
  fax_cc: 'Will fax credit card info to TriMet',
  mail_check: 'Will mail check to TriMet'
}

const inputProps = {
  min: 0,
  step: 1,
  type: 'number'
}
const GROUP_FIELDS = [
  {inputProps, fieldName: 'numStudents', label: 'students 7 or older'},
  {inputProps, fieldName: 'numFreeStudents', label: 'students under 7'},
  {inputProps, fieldName: 'numChaperones', label: 'chaperones'}
]
const PAYMENT_FIELDS = [
  {label: 'Ticket type', fieldName: 'ticketType', options: TICKET_TYPES},
  {label: 'Payment preference', fieldName: 'paymentPreference', options: PAYMENT_PREFS},
  {label: 'Invoice required', fieldName: 'requireInvoice', options: ['Yes', 'No']},
  {label: 'Class Pass Hop Card #', fieldName: 'classpassId'},
  {label: 'Credit card type', fieldName: 'ccType'},
  {label: 'Name on credit card', fieldName: 'ccName'},
  {label: 'Credit card last 4 digits', fieldName: 'ccLastFour'},
  {label: 'Check/Money order number', fieldName: 'checkNumber'}
]
/**
 * Shows the details for the active Field Trip Request.
 */
class FieldTripDetails extends Component {
  _editSubmitterNotes = (val) => this.props.editSubmitterNotes(this.props.request, val)

  _getRequestLink = (path, isPublic = false) =>
    `${this.props.datastoreUrl}/${isPublic ? 'public/' : ''}fieldtrip/${path}?requestId=${this.props.request.id}`

  _onCloseActiveFieldTrip = () => this.props.setActiveFieldTrip(null)

  _onClickCancel = () => {
    const {request, setRequestStatus} = this.props
    if (confirm('Are you sure you want to cancel this request? Any associated trips will be deleted.')) {
      setRequestStatus(request, 'cancelled')
    }
  }

  render () {
    const {
      addFieldTripNote,
      callTaker,
      dateFormat,
      deleteFieldTripNote,
      request,
      setRequestGroupSize,
      setRequestPaymentInfo
    } = this.props
    if (!request) return null
    const {
      id,
      notes,
      schoolName,
      submitterNotes,
      teacherName,
      travelDate
    } = request
    const {fieldTrip} = callTaker
    const defaultPosition = {...fieldTrip.position}
    const internalNotes = []
    const operationalNotes = []
    notes && notes.forEach(note => {
      if (note.type === 'internal') internalNotes.push(note)
      else operationalNotes.push(note)
    })
    defaultPosition.x = defaultPosition.x - 460
    defaultPosition.y = defaultPosition.y - 100
    const travelDateAsMoment = moment(travelDate)
    const total = getGroupSize(request)
    return (
      <DraggableWindow
        draggableProps={{ defaultPosition }}
        footer={
          <div style={{padding: '5px 10px 0px 10px'}}>
            <DropdownButton
              aria-label='Field Trip Menu'
              bsSize='xsmall'
              dropup
              id='field-trip-menu'
              title='View'
            >
              <MenuItem
                href={this._getRequestLink('feedbackForm', true)}
                target='_blank'
              >
                <Icon type='link' /> Feedback link
              </MenuItem>
              <MenuItem
                href={this._getRequestLink('receipt')}
                target='_blank'
              >
                <Icon type='file-text-o' /> Receipt link
              </MenuItem>
            </DropdownButton>
            <Button
              bsSize='xsmall'
              bsStyle='danger'
              className='pull-right'
              onClick={this._onClickCancel}
            >
              Cancel request
            </Button>
          </div>
        }
        header={
          <h4 style={{marginBottom: 0}}>
            <Icon type='graduation-cap' /> {schoolName} Trip (#{id})
            <div style={{marginLeft: '28px'}}>
              <small>
                Travel date: {travelDateAsMoment.format(dateFormat)}{' '}
                ({travelDateAsMoment.fromNow()})
              </small>
            </div>
          </h4>
        }
        height='375px'
        onClickClose={this._onCloseActiveFieldTrip}
        style={{width: '450px'}}
      >
        <Container>
          <Header>Group Information</Header>
          <Half>
            <P><B>{schoolName}</B></P>
            <P>Teacher: {teacherName}</P>
            <P>
              <Updatable
                fieldName='Teacher notes'
                label={<Icon type='sticky-note-o' title='Teacher notes' />}
                onUpdate={this._editSubmitterNotes}
                value={submitterNotes}
              />
            </P>
          </Half>
          <Half>
            <EditableSection
              children={<Text><B>{total}</B> total group size</Text>}
              fields={GROUP_FIELDS}
              inputStyle={{lineHeight: '0.8em', padding: '0px', width: '50px'}}
              onChange={setRequestGroupSize}
              request={request}
              valueFirst
            />
          </Half>
          <TripStatus
            outbound
            request={request}
          />
          <TripStatus request={request} />
          <FullWithMargin>
            <EditableSection
              // Use inline header so that 'Change' button appears on top line.
              children={
                <InlineHeader>
                  <Icon type='credit-card' /> Payment information
                </InlineHeader>
              }
              fields={PAYMENT_FIELDS}
              inputStyle={{lineHeight: '0.8em', padding: '0px', width: '100px'}}
              onChange={setRequestPaymentInfo}
              request={request}
            />
          </FullWithMargin>
          <FieldTripNotes
            addFieldTripNote={addFieldTripNote}
            deleteFieldTripNote={deleteFieldTripNote}
            request={request}
          />
        </Container>
      </DraggableWindow>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {activeId, requests} = state.callTaker.fieldTrip
  const request = requests.data.find(req => req.id === activeId)
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery,
    datastoreUrl: state.otp.config.datastoreUrl,
    dateFormat: getDateFormat(state.otp.config),
    request
  }
}

const mapDispatchToProps = {
  addFieldTripNote: fieldTripActions.addFieldTripNote,
  deleteFieldTripNote: fieldTripActions.deleteFieldTripNote,
  editSubmitterNotes: fieldTripActions.editSubmitterNotes,
  fetchQueries: fieldTripActions.fetchQueries,
  setActiveFieldTrip: fieldTripActions.setActiveFieldTrip,
  setFieldTripFilter: fieldTripActions.setFieldTripFilter,
  setRequestGroupSize: fieldTripActions.setRequestGroupSize,
  setRequestPaymentInfo: fieldTripActions.setRequestPaymentInfo,
  setRequestStatus: fieldTripActions.setRequestStatus,
  toggleFieldTrips: fieldTripActions.toggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldTripDetails)
