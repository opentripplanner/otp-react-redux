import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import queryParams from '../../util/query-params'

class SettingsPreview extends Component {
  static propTypes = {
    // component props
    caret: PropTypes.string,
    compressed: PropTypes.bool,
    editButtonText: PropTypes.element,
    icons: PropTypes.object,
    showCaret: PropTypes.bool,
    onClick: PropTypes.func,

    // application state
    companies: PropTypes.string,
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array
  }

  static defaultProps = {
    editButtonText: <i className='fa fa-pencil' />
  }

  render () {
    const { query, caret, editButtonText } = this.props

    const array1 = query.mode.split(',')
    const array2 = ['WALK', 'BUS', 'TRAM', 'RAIL', 'GONDOLA']

    let showDot = false
    const modesEqual = array1.length === array2.length && array1.sort().every((value, index) => { return value === array2.sort()[index] })

    if (!modesEqual) showDot = true
    else {
      // The universe of properties to consider
      // TODO: allow override in config
      const paramNames = [
        'maxWalkDistance',
        'maxWalkTime',
        'walkSpeed',
        'maxBikeDistance',
        'maxBikeTime',
        'bikeSpeed',
        'optimize',
        'optimizeBike'
      ]

      paramNames.forEach(param => {
        const paramInfo = queryParams.find(qp => qp.name === param)
        // Check that the parameter applies to the specified routingType
        if (!paramInfo.routingTypes.includes(query.routingType)) return

        // Check that the applicability test (if provided) is satisfied
        if (typeof paramInfo.applicable === 'function' &&
          !paramInfo.applicable(query)) return

        if (query[param] !== paramInfo.default) {
          showDot = true
          return
        }
      })
    }

    const button = (
      <div className='button-container'>
        <Button onClick={this.props.onClick}>
          {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
        {showDot && <div className='dot' />}
      </div>
    )

    return (
      <div className='settings-preview'>
        <div className='summary'>Travel<br />Options</div>
        {button}
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPreview)
