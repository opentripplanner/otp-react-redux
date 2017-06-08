import React, { Component } from 'react'
import { connect } from 'react-redux'

import MaxWalkSelector from './max-walk-selector'
import OptimizeSelector from './optimize-selector'

class GeneralSettingsPanel extends Component {
  render () {
    return (
      <div className='general-settings-panel'>
        <MaxWalkSelector />
        <OptimizeSelector />
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
