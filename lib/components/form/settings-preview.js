import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { mergeMessages } from '../../util/messages'
import { isNotDefaultQuery } from '../../util/query'

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
    editButtonText: <i className='fa fa-pencil' />,
    messages: {
      label: 'Transit Options\n& Preferences'
    }
  }

  render () {
    const { caret, config, query, editButtonText } = this.props
    const messages = mergeMessages(SettingsPreview.defaultProps, this.props)
    // Show dot indicator if the current query differs from the default query.
    let showDot = isNotDefaultQuery(query, config)
    const button = (
      <div className='button-container'>
        <Button onClick={this.props.onClick}>
          {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
        {showDot && <div className='dot' />}
      </div>
    )
    // Add tall class to account for vertical centering if there is only
    // one line in the label (default is 2).
    const addClass = messages.label.match(/\n/) ? '' : ' tall'
    return (
      <div className='settings-preview' onClick={this.props.onClick}>
        <div className={`summary${addClass}`}>
          {messages.label}
        </div>
        {button}
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    messages: state.otp.config.language.settingsPreview,
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPreview)
