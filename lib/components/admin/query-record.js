import { planParamsToQuery } from '@opentripplanner/core-utils/lib/query'
import { getTimeFormat, OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as formActions from '../../actions/form'
import { parseQueryParams } from '../../util/call-taker'

import { CallRecordButton, CallRecordIcon } from './styled'

/**
 * Displays information for a query stored for the Call Taker module.
 */
class QueryRecordLayout extends Component {
  _getParams = () => planParamsToQuery(parseQueryParams(this.props.query.queryParams))

  _viewQuery = () => {
    const {parseUrlQueryString} = this.props
    const params = this._getParams()
    parseUrlQueryString(params, '_CALL')
  }

  render () {
    const {query, timeFormat} = this.props
    const params = this._getParams()
    const time = query.timeStamp
      ? moment(query.timeStamp).format(timeFormat)
      : moment(params.time, OTP_API_TIME_FORMAT).format(timeFormat)
    return (
      <li>
        <CallRecordButton className='clear-button-formatting' onClick={this._viewQuery}>
          <CallRecordIcon type='search' />
          {time}<br />
          {params.from.name} to {params.to.name}
        </CallRecordButton>
      </li>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const {parseUrlQueryString} = formActions

const mapDispatchToProps = { parseUrlQueryString }

const QueryRecord = connect(mapStateToProps, mapDispatchToProps)(QueryRecordLayout)
export default QueryRecord
