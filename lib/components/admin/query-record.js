import { planParamsToQuery } from '@opentripplanner/core-utils/lib/query'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as formActions from '../../actions/form'
import Icon from '../narrative/icon'

/**
 * Displays information for a query stored for the Call Taker module.
 */
class QueryRecordLayout extends Component {
  _getParams = () => {
    const {query} = this.props
    return planParamsToQuery(JSON.parse(query.queryParams))
  }

  _viewQuery = () => {
    const {parseUrlQueryString} = this.props
    const params = this._getParams()
    if ('arriveBy' in params) {
      params.departArrive = params.arriveBy ? 'ARRIVE' : 'DEPART'
    }
    parseUrlQueryString(params)
  }

  render () {
    const params = this._getParams()
    // console.log(this.props, params)
    return (
      <li>
        <button onClick={this._viewQuery} className='clear-button-formatting'>
          <Icon type='search' />
        </button>{' '}
        {params.time}<br />
        {params.from.name} to {params.to.name}
      </li>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config
  }
}

const {parseUrlQueryString} = formActions

const mapDispatchToProps = { parseUrlQueryString }

const QueryRecord = connect(mapStateToProps, mapDispatchToProps)(QueryRecordLayout)
export default QueryRecord
