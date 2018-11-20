import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { isMobile } from '../../util/ui'

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
    const { caret, editButtonText } = this.props

    const button = (
      <div className='button-container'>
        <Button onClick={this.props.onClick}>
          {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
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
  const {config, currentQuery} = state.otp
  const {companies, mode} = currentQuery
  return {
    companies,
    modeGroups: config.modeGroups,
    queryModes: mode.split(',')
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPreview)
