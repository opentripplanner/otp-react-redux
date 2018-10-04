import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { getActiveSearch } from '../../util/state'

class ErrorMessage extends Component {
  static propTypes = {
    error: PropTypes.object
  }

  render () {
    const { error, errorMessages, currentQuery } = this.props
    if (!error) return null

    let message = error.msg
    // check for configuration-defined message override
    if (errorMessages) {
      const msgConfig = errorMessages.find(m => m.id === error.id)
      if (msgConfig) {
        if (msgConfig.modes) {
          for (const mode of msgConfig.modes) {
            if (currentQuery.mode.includes(mode)) {
              message = msgConfig.msg
              break
            }
          }
        } else message = msgConfig.msg
      }
    }

    return (
      <div className='error-message'>
        <div className='header'>
          <i className='fa fa-exclamation-circle' /> Could Not Plan Trip
        </div>
        <div className='message'>{message}</div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    error: activeSearch && activeSearch.response && activeSearch.response.error,
    currentQuery: state.otp.currentQuery,
    errorMessages: state.otp.config.errorMessages
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage)
