/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { format, parse } from 'date-fns'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import { planParamsToQuery } from '@opentripplanner/core-utils/lib/query'
import React, { Component } from 'react'

import * as formActions from '../../actions/form'
import { injectIntl } from 'react-intl'
import { parseDate, parseQueryParams } from '../../util/call-taker'

import { Search } from '@styled-icons/fa-solid/Search'

import { OriginDestinationContainer, QueryRecordButton } from './styled'
import OriginDestination from '../util/origin-destination-layout'

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
    const { intl, query, timeFormat } = this.props
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
        <QueryRecordButton
          className="clear-button-formatting"
          onClick={this._viewQuery}
        >
          <div className="search-container">
            <Search size={14} />
          </div>
          <OriginDestinationContainer>
            <OriginDestination
              from={params.from.name}
              intl={intl}
              to={params.to.name}
            />
          </OriginDestinationContainer>
        </QueryRecordButton>
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
)(injectIntl(QueryRecordLayout))
export default QueryRecord
