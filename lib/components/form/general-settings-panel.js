import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import CheckboxSelector from './checkbox-selector'
import DropdownSelector from './dropdown-selector'
import queryParams from '../../util/query-params'
import { defaultParams, getQueryParamProperty } from '../../util/query'

class GeneralSettingsPanel extends Component {
  static propTypes = {
    query: PropTypes.object,
    paramNames: PropTypes.array
  }

  static defaultProps = {
    // The universe of properties to include in this form:
    // TODO: allow override in config
    paramNames: defaultParams
  }

  render () {
    const { paramNames, query, config } = this.props
    return (
      <div className='general-settings-panel'>
        {paramNames.map(param => {
          const paramInfo = queryParams.find(qp => qp.name === param)
          // Check that the parameter applies to the specified routingType
          if (!paramInfo.routingTypes.includes(query.routingType)) return

          // Check that the applicability test (if provided) is satisfied
          if (typeof paramInfo.applicable === 'function' &&
            !paramInfo.applicable(query, config)) return

          // Create the UI component based on the selector type
          switch (paramInfo.selector) {
            case 'DROPDOWN':
              return <DropdownSelector
                key={paramInfo.name}
                name={paramInfo.name}
                value={query[paramInfo.name]}
                label={getQueryParamProperty(paramInfo, 'label', query)}
                options={getQueryParamProperty(paramInfo, 'options', query)}
              />
            case 'CHECKBOX':
              return <CheckboxSelector
                key={paramInfo.label}
                name={paramInfo.name}
                value={query[paramInfo.name]}
                label={getQueryParamProperty(paramInfo, 'label', query)}
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
    config: state.otp.config,
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsPanel)
