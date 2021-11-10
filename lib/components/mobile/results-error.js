import PropTypes from 'prop-types'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import ErrorMessage from '../form/error-message'
import Icon from '../util/icon'

import EditSearchButton from './edit-search-button'

/**
 * This component is used on mobile views to
 * render an error message if no results are found.
 */
const ResultsError = ({ className, error }) => (
  <div className={`results-error-message ${className}`}>
    <ErrorMessage error={error} />
    <div className='options-lower-tray mobile-padding'>
      <EditSearchButton
        className='back-to-search-button'
        style={{ width: '100%' }}
      >
        <Icon className='fa fa-arrow-left' type='arrow-left' withSpace />
        <FormattedMessage id='components.ResultsError.backToSearch' />
      </EditSearchButton>
    </div>
  </div>
)

ResultsError.propTypes = {
  error: PropTypes.object
}

const StyledResultsError = styled(ResultsError)`
  top: 300px;
`

export default StyledResultsError
