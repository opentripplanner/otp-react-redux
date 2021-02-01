import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import DraggableWindow from './draggable-window'
import FieldTripNotes from './field-trip-notes'
import Icon from '../narrative/icon'
import {
  B,
  Button,
  Container,
  Half,
  Full,
  Header,
  P,
  Val
} from './styled'
import TripStatus from './trip-status'
import Updatable from './updatable'

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
/**
 * Shows the details for the active Field Trip Request.
 */
class FieldTripDetails extends Component {
  state ={
    expandNotes: true
  }

  _editSubmitterNotes = (val) => this.props.editSubmitterNotes(this.props.request, val)

  _onCloseActiveFieldTrip = () => this.props.setActiveFieldTrip(null)

  _onClickCancel = () => {
    const {request, setRequestStatus} = this.props
    if (confirm('Are you sure you want to cancel this request? Any associated trips will be deleted.')) {
      setRequestStatus(request, 'cancelled')
    }
  }

  _toggleNotes = () => this.setState({expandNotes: !this.state.expandNotes})

  render () {
    const {
      addFieldTripNote,
      callTaker,
      deleteFieldTripNote,
      request
    } = this.props
    if (!request) return null
    const {
      ccLastFour,
      ccName,
      ccType,
      checkNumber,
      classpassId,
      id,
      notes,
      numChaperones,
      numFreeStudents,
      numStudents,
      paymentPreference,
      requireInvoice,
      schoolName,
      submitterNotes,
      teacherName,
      ticketType,
      travelDate
    } = request
    const total = numStudents + numChaperones + numFreeStudents
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
              <MenuItem onClick={this._showRouteViewer}>
                <Icon type='link' /> Feedback link
              </MenuItem>
              <MenuItem onClick={this._startOver}>
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
          <h4>
            <Icon type='graduation-cap' /> {schoolName} Trip (#{id})
          </h4>
        }
        height='375px'
        onClickClose={this._onCloseActiveFieldTrip}
        style={{width: '450px'}}
      >
        <Container>
          <Header>Group Information ({travelDate})</Header>
          <Half>
            <P><B>{schoolName}</B></P>
            <P>Teacher: {teacherName}</P>
            <P>
              <Updatable
                fieldName='Teacher notes'
                onUpdate={this._editSubmitterNotes}
                value={submitterNotes}
              />
            </P>
          </Half>
          <Half>
            <P>
              <B>Total group size:</B> {total}
              <Button bsSize='xs' onClick={this._onChangeSize}>
                Change
              </Button>
            </P>
            <P>{numStudents} students 7 or older</P>
            <P>{numFreeStudents} students under 7</P>
            <P>{numStudents} chaperones</P>
          </Half>
          <TripStatus
            outbound
            request={request}
          />
          <TripStatus request={request} />
          <Full>
            <Header>
              <Icon type='credit-card' /> Payment information
            </Header>
            <P>Ticket type: <Val>{TICKET_TYPES[ticketType]}</Val></P>
            <P>Payment preference: <Val>{PAYMENT_PREFS[paymentPreference]}</Val></P>
            <P>Invoice required: <Updatable fieldName='require invoice' value={requireInvoice} /></P>
            <P>Class Pass Hop Card #: <Val>{classpassId}</Val></P>
            <P>Credit card type: <Val>{ccType}</Val></P>
            <P>Name on credit card: <Val>{ccName}</Val></P>
            <P>Credit card last 4 digits: <Val>{ccLastFour}</Val></P>
            <P>Check/Money order number: <Val>{checkNumber}</Val></P>
          </Full>
          <FieldTripNotes
            addFieldTripNote={addFieldTripNote}
            deleteFieldTripNote={deleteFieldTripNote}
            expanded={this.state.expandNotes}
            onClickToggle={this._toggleNotes}
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
    request
  }
}

const mapDispatchToProps = {
  addFieldTripNote: callTakerActions.addFieldTripNote,
  deleteFieldTripNote: callTakerActions.deleteFieldTripNote,
  editSubmitterNotes: callTakerActions.editSubmitterNotes,
  fetchQueries: callTakerActions.fetchQueries,
  setActiveFieldTrip: callTakerActions.setActiveFieldTrip,
  setFieldTripFilter: callTakerActions.setFieldTripFilter,
  setRequestStatus: callTakerActions.setRequestStatus,
  toggleFieldTrips: callTakerActions.toggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldTripDetails)
