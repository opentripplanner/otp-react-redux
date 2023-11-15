/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { format, parse } from 'date-fns'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import { planParamsToQuery } from '@opentripplanner/core-utils/lib/query'
import React, { Component } from 'react'

import * as formActions from '../../actions/form'
import { parseDate, parseQueryParams } from '../../util/call-taker'

import { CallRecordButton, CallRecordIcon } from './styled'

/**
 * Displays information for a query stored for the Call Taker module.
 */
class QueryRecordLayout extends Component {
  _getParams = () =>
    planParamsToQuery(parseQueryParams(this.props.query.queryParams))

  _viewQuery = () => {
    const { parseUrlQueryString } = this.props
    const params = this._getParams()
    parseUrlQueryString(params, '_CALL')
  }

  render() {
    const { query, timeFormat } = this.props
    const params = this._getParams()
    const now = Date.now()
    const time = format(
      query.timeStamp
        ? parseDate(query.timeStamp)
        : parse(params.time, 'H:mm', now),
      timeFormat
    )
    return (
      <li>
        <CallRecordButton
          className="clear-button-formatting"
          onClick={this._viewQuery}
        >
          <CallRecordIcon type="search" />
          {params.from.name} to {params.to.name} at {time}
        </CallRecordButton>
      </li>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const { parseUrlQueryString } = formActions

const mapDispatchToProps = { parseUrlQueryString }

const QueryRecord = connect(
  mapStateToProps,
  mapDispatchToProps
)(QueryRecordLayout)
export default QueryRecord
