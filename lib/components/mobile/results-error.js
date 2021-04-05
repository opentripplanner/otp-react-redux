import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import * as uiActions from '../../actions/ui'
import ErrorMessage from '../form/error-message'

/**
 * This component is used on mobile views to
 * render an error message if no results are found.
 */
class ResultsError extends Component {
  static propTypes = {
    error: PropTypes.object,
    setItineraryView: PropTypes.func,
    setMobileScreen: PropTypes.func
  }

  _editSearchClicked = () => {
    // Reset itinerary view state to show the list of results *before* clearing the search.
    // (Otherwise, if the map is expanded, the search is not cleared.)
    this.props.setItineraryView(uiActions.ItineraryView.LIST)
    this.props.clearActiveSearch()
    this.props.setMobileScreen(uiActions.MobileScreens.SEARCH_FORM)
  }

  render () {
    const { className, error } = this.props
    return (
      <div className={`results-error-message ${className}`}>
        <ErrorMessage error={error} />
        <div className='options-lower-tray mobile-padding'>
          <Button
            className='back-to-search-button'
            onClick={this._editSearchClicked}
            style={{ width: '100%' }}
          >
            <i className='fa fa-arrow-left' /> Back to Search
          </Button>
        </div>
      </div>
    )
  }
}

const StyledResultsError = styled(ResultsError)`
  top: 300px;
`

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  clearActiveSearch: formActions.clearActiveSearch,
  setItineraryView: uiActions.setItineraryView,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(StyledResultsError)
