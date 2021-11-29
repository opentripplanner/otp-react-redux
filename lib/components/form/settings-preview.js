// FIXME: Remove the following eslint rule exceptions.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'

import { Dot } from './styled'

function SettingsPreview (props) {
  const {
    caret,
    config,
    editButtonText,
    onClick,
    query
  } = props
  const intl = useIntl()
  const messages = {
    label: intl.formatMessage({id: 'components.SettingsPreview.defaultPreviewText'})
  }
  // Show dot indicator if the current query differs from the default query.
  const showDot = coreUtils.query.isNotDefaultQuery(query, config)
  const button = (
    <div className='button-container'>
      <Button
        aria-label={messages.label.replace('\n', ' ')}
        onClick={onClick}
      >
        {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
      </Button>
      {showDot && <Dot className='dot' />}
    </div>
  )
  // Add tall class to account for vertical centering if there is only
  // one line in the label (default is 2).
  const addClass = messages.label.match(/\n/) ? '' : ' tall'
  return (
    <div className='settings-preview' onClick={onClick}>
      <div className={`summary${addClass}`}>
        {messages.label}
      </div>
      {button}
      <div style={{ clear: 'both' }} />
    </div>
  )
}

SettingsPreview.propTypes = {
  // component props
  caret: PropTypes.string,
  compressed: PropTypes.bool,
  editButtonText: PropTypes.element,
  onClick: PropTypes.func,
  showCaret: PropTypes.bool,

  // application state
  // eslint-disable-next-line sort-keys
  companies: PropTypes.string,
  modeGroups: PropTypes.array,
  queryModes: PropTypes.array
}

SettingsPreview.defaultProps = {
  editButtonText: <i className='fa fa-pencil' />
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPreview)
