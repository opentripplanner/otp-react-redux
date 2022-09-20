import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import ErrorMessage from '../form/error-message'
import StyledIconWrapper from '../util/styledIcon'

import EditSearchButton from './edit-search-button'

/**
 * This component is used on mobile views to
 * render an error message if no results are found.
 */
const ResultsError = ({ className, error }) => (
  <div className={`results-error-message ${className}`}>
    <ErrorMessage error={error} />
    <div className="options-lower-tray mobile-padding">
      <EditSearchButton
        className="back-to-search-button"
        style={{ width: '100%' }}
      >
        <StyledIconWrapper spaceAfter>
          <ArrowLeft />
        </StyledIconWrapper>
        <FormattedMessage id="components.ResultsError.backToSearch" />
      </EditSearchButton>
    </div>
  </div>
)

ResultsError.propTypes = {
  className: PropTypes.string,
  error: PropTypes.object
}

const StyledResultsError = styled(ResultsError)`
  top: 300px;
`

export default StyledResultsError
