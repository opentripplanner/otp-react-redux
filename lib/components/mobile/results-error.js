import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import ErrorMessage from '../form/error-message'

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
        <i className='fa fa-arrow-left' /> Back to Search
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
