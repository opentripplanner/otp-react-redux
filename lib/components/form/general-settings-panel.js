import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import DropdownSelector from './dropdown-selector'
import queryParams from '../../common/query-params'

class GeneralSettingsPanel extends Component {
  static propTypes = {
    query: PropTypes.object,
    paramNames: PropTypes.array
  }

  static defaultProps = {
    paramNames: [ 'maxWalkDistance', 'maxWalkTime', 'walkSpeed', 'maxBikeTime', 'bikeSpeed', 'optimize' ]
  }

  render () {
    const { paramNames, query } = this.props
    return (
      <div className='general-settings-panel'>
        {paramNames.map(param => {
          const paramInfo = queryParams.find(qp => qp.name === param)
          if (paramInfo.planTypes.indexOf(query.type) === -1) return
          switch (paramInfo.selector) {
            case 'DROPDOWN':
              return <DropdownSelector
                key={paramInfo.name}
                name={paramInfo.name}
                value={query[paramInfo.name]}
                label={paramInfo.label}
                options={paramInfo.options}
              />
          }
        })}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsPanel)
