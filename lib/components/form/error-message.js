import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { getActiveSearch } from '../../util/state'

class ErrorMessage extends Component {
  static propTypes = {
    error: PropTypes.object
  }

  render () {
    const { error } = this.props
    if (!error) return null

    return (
      <div className='error-message'>
        <div className='header'>
          <i className='fa fa-exclamation-circle' /> Could Not Plan Trip
        </div>
        <div className='message'>{error.msg}</div>
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
