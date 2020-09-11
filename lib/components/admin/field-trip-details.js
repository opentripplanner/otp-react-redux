import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import DraggableWindow from './draggable-window'
import Icon from '../narrative/icon'

/**
 * Shows the details for the active Field Trip Request.
 */
class FieldTripDetails extends Component {
  _onCloseActiveFieldTrip = () => {
    this.props.setActiveFieldTrip(null)
  }

  render () {
    const {callTaker, request} = this.props
    if (!request) return null
    const {id, schoolName} = request
    const {fieldTrip} = callTaker
    const defaultPosition = {...fieldTrip.position}
    defaultPosition.x = defaultPosition.x - 460
    return (
      <DraggableWindow
        draggableProps={{ defaultPosition }}
        header={
          <h4>
            <Icon type='graduation-cap' /> {schoolName} Trip (#{id})
          </h4>
        }
        onClickClose={this._onCloseActiveFieldTrip}
        style={{width: '450px'}}
      >
        {Object.keys(request).map(key => {
          const value = typeof request[key] === 'object'
            ? 'TODO: object'
            : request[key]
          return (<div key={key}>{key}: {value}</div>)
        })}
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
  fetchQueries: callTakerActions.fetchQueries,
  setActiveFieldTrip: callTakerActions.setActiveFieldTrip,
  setFieldTripFilter: callTakerActions.setFieldTripFilter,
  toggleFieldTrips: callTakerActions.toggleFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldTripDetails)
