import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

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
    setMobileScreen: PropTypes.func
  }

  _editSearchClicked = () => {
    this.props.clearActiveSearch()
    this.props.setMobileScreen(uiActions.MobileScreens.SEARCH_FORM)
  }

  render () {
    const { error } = this.props
    return (
      <div className='results-error-message'>
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

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  clearActiveSearch: formActions.clearActiveSearch,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsError)
