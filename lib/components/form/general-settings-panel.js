import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import DropdownSelector from './dropdown-selector'
import queryParams from '../../util/query-params'

class GeneralSettingsPanel extends Component {
  static propTypes = {
    query: PropTypes.object,
    paramNames: PropTypes.array
  }

  static defaultProps = {
    // The universe of properties to include in this form:
    // TODO: allow override in config
    paramNames: [
      'maxWalkDistance',
      'maxWalkTime',
      'walkSpeed',
      'maxBikeDistance',
      'maxBikeTime',
      'bikeSpeed',
      'optimize'
    ]
  }

  render () {
    const { paramNames, query } = this.props
    return (
      <div className='general-settings-panel'>
        {paramNames.map(param => {
          const paramInfo = queryParams.find(qp => qp.name === param)
          // Check that the parameter applies to the specified routingType
          if (!paramInfo.routingTypes.includes(query.routingType)) return

          // Check that the applicability test (if provided) is satisfied
          if (typeof paramInfo.applicable === 'function' &&
            !paramInfo.applicable(query)) return

          // Create the UI component based on the selector type
          switch (paramInfo.selector) {
            case 'DROPDOWN':
              return <DropdownSelector
                key={paramInfo.name}
                name={paramInfo.name}
                value={query[paramInfo.name]}
                label={typeof paramInfo.label === 'function'
                  ? paramInfo.label(query)
                  : paramInfo.label
                }
                options={typeof paramInfo.options === 'function'
                  ? paramInfo.options(query)
                  : paramInfo.options
                }
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
