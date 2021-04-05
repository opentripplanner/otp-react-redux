import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as formActions from '../../actions/form'
import * as uiActions from '../../actions/ui'

/**
 * Renders the "Edit" or "Back to search" button in mobile result views
 * that takes the user back to the mobile search screen.
 */
class EditSearchButton extends Component {
  static propTypes = {
    clearActiveSearch: PropTypes.func,
    setItineraryView: PropTypes.func,
    setMobileScreen: PropTypes.func
  }

  _handleClick = () => {
    const { clearActiveSearch, setItineraryView, setMobileScreen } = this.props

    // Reset itinerary view state to show the list of results *before* clearing the search.
    // (Otherwise, if the map is expanded, the search is not cleared.)
    setItineraryView(uiActions.ItineraryView.LIST)
    clearActiveSearch()
    setMobileScreen(uiActions.MobileScreens.SEARCH_FORM)
  }

  render () {
    const { children, className, style } = this.props
    return (
      <Button
        className={className}
        onClick={this._handleClick}
        style={style}
      >
        {children}
      </Button>
    )
  }
}

// connect to the redux store

const mapDispatchToProps = {
  clearActiveSearch: formActions.clearActiveSearch,
  setItineraryView: uiActions.setItineraryView,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(null, mapDispatchToProps)(EditSearchButton)
