import React, { Component } from 'react'
import { connect } from 'react-redux'

class GeneralSettingsPanel extends Component {
  render () {
    return (
      <div className='modes-panel'>
        General Settings
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsPanel)
