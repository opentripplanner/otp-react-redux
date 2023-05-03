/* eslint-disable react/prop-types */
import { CommentDots } from '@styled-icons/fa-regular/CommentDots'
import { connect } from 'react-redux'
import { CreditCard } from '@styled-icons/fa-regular/CreditCard'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { FileAlt } from '@styled-icons/fa-regular/FileAlt'
import { format, formatDistanceToNow, parse } from 'date-fns'
import {
  getDateFormat,
  // yyyy-MM-dd, which is same format required for date input controls.
  OTP_API_DATE_FORMAT,
  OTP_API_DATE_FORMAT_DATE_FNS
} from '@opentripplanner/core-utils/lib/time'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { injectIntl } from 'react-intl'
import { Print } from '@styled-icons/fa-solid/Print'
import { StickyNote } from '@styled-icons/fa-regular/StickyNote'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as fieldTripActions from '../../actions/field-trip'
import { getActiveFieldTripRequest } from '../../util/state'
import {
  getGroupSize,
  GROUP_FIELDS,
  parseDate,
  PAYMENT_FIELDS,
  TICKET_TYPES
} from '../../util/call-taker'
import { IconWithText, StyledIconWrapper } from '../util/styledIcon'
import { NewWindowIconA11y } from '../util/externalLink'

import {
  Bold,
  Button,
  Container,
  WindowHeader as DefaultWindowHeader,
  FullWithMargin,
  Half,
  Header,
  InlineHeader,
  Para,
  Text,
  Val
} from './styled'
import DraggableWindow from './draggable-window'
import EditableSection from './editable-section'
import FieldTripNotes from './field-trip-notes'
import TripStatus from './trip-status'
import Updatable from './updatable'

const WindowHeader = styled(DefaultWindowHeader)`
  margin-bottom: 0px;
`

/**
 * Shows the details for the active Field Trip Request.
 */
class FieldTripDetails extends Component {
  _editSubmitterNotes = (val) => {
    const { editSubmitterNotes, intl, request } = this.props
    editSubmitterNotes(request, val, intl)
  }

  _getRequestLink = (path, isPublic = false) => {
    return `${this.props.datastoreUrl}/${
      isPublic ? 'public/' : ''
    }fieldtrip/${path}?requestId=${this.props.request.id}`
  }

  _onToggleStatus = () => {
    const { intl, request, setRequestStatus } = this.props
    if (request.status !== 'cancelled') {
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(
          'Are you sure you want to cancel this request? Any associated trips will be deleted.'
        )
      ) {
        setRequestStatus(request, 'cancelled', intl)
      }
    } else {
      setRequestStatus(request, 'active', intl)
    }
  }

  _setRequestDate = (evt) => {
    const newDateValue = evt.target.value
    // Only persist the date if it is valid (not an empty string)
    if (newDateValue !== '') {
      const { dateFormat, intl, request, setRequestDate } = this.props
      const newDate = parse(newDateValue, OTP_API_DATE_FORMAT, new Date())
      const convertedRequestDate = format(newDate, dateFormat)
      setRequestDate(request, convertedRequestDate, intl)
    }
  }

  _renderFooter = () => {
    const { request, sessionId } = this.props
    const cancelled = request.status === 'cancelled'
    const printFieldTripLink = `/#/printFieldTrip/?requestId=${request.id}&sessionId=${sessionId}`
    const StyledNewWindowIcon = () => (
      <NewWindowIconA11y size={10} style={{ margin: '-3px 0 0 4px' }} />
    )
    return (
      <div style={{ padding: '5px 10px 0px 10px' }}>
        <DropdownButton
          aria-label="Field Trip Menu"
          bsSize="xsmall"
          dropup
          id="field-trip-menu"
          title="View"
        >
          <MenuItem
            href={this._getRequestLink('feedbackForm', true)}
            target="_blank"
          >
            <IconWithText Icon={CommentDots}>Feedback link</IconWithText>
            <StyledNewWindowIcon />
          </MenuItem>
          <MenuItem href={this._getRequestLink('receipt')} target="_blank">
            <IconWithText Icon={FileAlt}>Receipt link</IconWithText>
            <StyledNewWindowIcon />
          </MenuItem>
          <MenuItem href={printFieldTripLink} target="_blank">
            <IconWithText Icon={Print}>Printable trip plan</IconWithText>
            <StyledNewWindowIcon />
          </MenuItem>
        </DropdownButton>
        <Button
          bsSize="xsmall"
          bsStyle={cancelled ? undefined : 'danger'}
          className="pull-right"
          onClick={this._onToggleStatus}
        >
          {cancelled ? 'Reactivate' : 'Cancel'} request
        </Button>
      </div>
    )
  }

  _renderHeader = () => {
    const { request } = this.props
    const { id, schoolName, travelDate: travelDateValue } = request
    const travelDate = parseDate(travelDateValue)
    const travelDateFormatted = travelDateValue
      ? format(travelDate, OTP_API_DATE_FORMAT)
      : null
    return (
      <WindowHeader>
        <IconWithText Icon={GraduationCap}>
          {schoolName} Trip (#{id})
        </IconWithText>
        <div style={{ marginLeft: '28px' }}>
          <small>
            Travel date:
            <input
              className="datetime-slim btn-link"
              // This input control is uncontrolled, to let users clear the day/month/year fields
              // before they enter another value in there.
              // That means this control needs to be reset when the travel date or the edited trip changes
              // (see comment on the key prop below).
              defaultValue={travelDateFormatted}
              // Reset the input control to the defaultValue above and discard any edits when
              // a field trip value gets edited/reloaded with a different date,
              // or a different trip (with the same or a different date) is selected in the field trip list.
              key={`${id}-${travelDateFormatted}`}
              onBlur={this._setRequestDate}
              style={{
                border: 'none',
                minWidth: '90px',
                outline: 'none'
              }}
              type="date"
            />
            {travelDateValue &&
              formatDistanceToNow(travelDate, { addSuffix: true })}
          </small>
        </div>
      </WindowHeader>
    )
  }

  render() {
    const {
      addFieldTripNote,
      clearActiveFieldTrip,
      deleteFieldTripNote,
      intl,
      request,
      setRequestGroupSize,
      setRequestPaymentInfo,
      style
    } = this.props
    if (!request) return null
    request.numPaidStudents = request.numStudents - request.numFreeStudents

    const {
      invoiceRequired,
      notes,
      schoolName,
      submitterNotes,
      teacherName,
      ticketType
    } = request
    const internalNotes = []
    const operationalNotes = []
    notes &&
      notes.forEach((note) => {
        if (note.type === 'internal') internalNotes.push(note)
        else operationalNotes.push(note)
      })
    return (
      <DraggableWindow
        footer={this._renderFooter()}
        header={this._renderHeader()}
        height="375px"
        onClickClose={clearActiveFieldTrip}
        style={style}
      >
        <Container>
          <Header>Group Information</Header>
          <Half>
            <Para>
              <Bold>{schoolName}</Bold>
            </Para>
            <Para>Teacher: {teacherName}</Para>
            <Para>
              Ticket type: <Val>{TICKET_TYPES[ticketType]}</Val>
            </Para>
            <Para>
              Invoice required: <Val>{invoiceRequired ? 'Yes' : 'No'}</Val>
            </Para>
            <Para>
              <Updatable
                fieldName="Teacher notes"
                label={
                  <StyledIconWrapper>
                    <StickyNote />
                  </StyledIconWrapper>
                }
                onUpdate={this._editSubmitterNotes}
                value={submitterNotes}
              />
            </Para>
          </Half>
          <Half>
            <EditableSection
              // This is a custom children prop
              // eslint-disable-next-line react/no-children-prop
              children={
                <Text>
                  <Bold>{getGroupSize(request)}</Bold> total
                </Text>
              }
              fields={GROUP_FIELDS}
              inputStyle={{
                lineHeight: '0.8em',
                padding: '0px',
                width: '50px'
              }}
              intl={intl}
              onChange={setRequestGroupSize}
              request={request}
              valueFirst
            />
          </Half>
          <TripStatus outbound request={request} />
          <TripStatus request={request} />
          <FullWithMargin>
            <EditableSection
              // Use inline header so that 'Change' button appears on top line.
              // This is a custom children prop
              // eslint-disable-next-line react/no-children-prop
              children={
                <InlineHeader>
                  <IconWithText Icon={CreditCard}>
                    Payment information
                  </IconWithText>
                </InlineHeader>
              }
              fields={PAYMENT_FIELDS}
              inputStyle={{
                lineHeight: '0.8em',
                padding: '0px',
                width: '100px'
              }}
              intl={intl}
              onChange={setRequestPaymentInfo}
              request={request}
            />
          </FullWithMargin>
          <FieldTripNotes
            addFieldTripNote={addFieldTripNote}
            deleteFieldTripNote={deleteFieldTripNote}
            intl={intl}
            request={request}
          />
        </Container>
      </DraggableWindow>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentQuery: state.otp.currentQuery,
    datastoreUrl: state.otp.config.datastoreUrl,
    dateFormat: getDateFormat(state.otp.config),
    request: getActiveFieldTripRequest(state),
    sessionId: state.callTaker.session.sessionId
  }
}

const mapDispatchToProps = {
  addFieldTripNote: fieldTripActions.addFieldTripNote,
  clearActiveFieldTrip: fieldTripActions.clearActiveFieldTrip,
  deleteFieldTripNote: fieldTripActions.deleteFieldTripNote,
  editSubmitterNotes: fieldTripActions.editSubmitterNotes,
  setActiveFieldTrip: fieldTripActions.setActiveFieldTrip,
  setRequestDate: fieldTripActions.setRequestDate,
  setRequestGroupSize: fieldTripActions.setRequestGroupSize,
  setRequestPaymentInfo: fieldTripActions.setRequestPaymentInfo,
  setRequestStatus: fieldTripActions.setRequestStatus,
  toggleFieldTrips: fieldTripActions.toggleFieldTrips
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FieldTripDetails))
