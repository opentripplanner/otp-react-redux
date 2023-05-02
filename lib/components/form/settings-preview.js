// FIXME: Remove the following eslint rule exceptions.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from 'react-bootstrap'
import { CaretDown } from '@styled-icons/fa-solid/CaretDown'
import { CaretUp } from '@styled-icons/fa-solid/CaretUp'
import { connect } from 'react-redux'
import { PencilAlt } from '@styled-icons/fa-solid/PencilAlt'
import { useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React from 'react'

import { Dot } from './styled'
import { StyledIconWrapper } from '../util/styledIcon'

function SettingsPreview(props) {
  const { caret, config, editButtonText, onClick, query } = props
  const intl = useIntl()
  const messages = {
    label: intl.formatMessage({
      id: 'components.SettingsPreview.defaultPreviewText'
    })
  }
  // Show dot indicator if the current query differs from the default query.
  const showDot = coreUtils.query.isNotDefaultQuery(query, config)
  const button = (
    <div className="button-container">
      <Button
        aria-label={messages.label.replaceAll('\n', ' ')}
        onClick={onClick}
        style={{ padding: 0 }}
      >
        {editButtonText}{' '}
        {caret && <span>{caret === 'up' ? <CaretUp /> : <CaretDown />}</span>}
      </Button>
      {showDot && <Dot className="dot" />}
    </div>
  )
  // Add tall class to account for vertical centering if there is only
  // one line in the label (default is 2).
  const addClass = messages.label.match(/\n/) ? '' : ' tall'
  return (
    <div className="settings-preview" onClick={onClick}>
      <div className={`summary${addClass}`}>{messages.label}</div>
      {button}
      <div style={{ clear: 'both' }} />
    </div>
  )
}

SettingsPreview.propTypes = {
  // component props
  caret: PropTypes.string,
  // application state
  // eslint-disable-next-line sort-keys
  companies: PropTypes.string,
  compressed: PropTypes.bool,
  config: PropTypes.object,
  editButtonText: PropTypes.element,
  modeGroups: PropTypes.array,
  onClick: PropTypes.func,
  query: PropTypes.object,
  queryModes: PropTypes.array,
  showCaret: PropTypes.bool
}

SettingsPreview.defaultProps = {
  editButtonText: (
    <StyledIconWrapper>
      <PencilAlt />
    </StyledIconWrapper>
  )
}

const mapStateToProps = (state) => {
  return {
    config: state.otp.config,
    query: state.otp.currentQuery
  }
}

export default connect(mapStateToProps)(SettingsPreview)
