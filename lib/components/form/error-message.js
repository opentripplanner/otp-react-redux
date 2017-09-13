import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { getActiveSearch } from '../../util/state'

class ErrorMessage extends Component {
  static propTypes = {
    itineraries: PropTypes.array
  }

  render () {
    const { error } = this.props
    if (!error) return null

    return (
      <div className='alert alert-danger error'>
        <div className='header'>Error!</div>
        <div className='message'>{error.message}</div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    error: activeSearch && activeSearch.response && activeSearch.response.error
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage)
