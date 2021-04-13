import React from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'

/**
 * Renders the "Edit" or "Back to search" button in mobile result views
 * that takes the user back to the mobile search screen.
 */
const EditSearchButton = ({ showMobileSearchScreen, ...props }) => (
  <Button onClick={showMobileSearchScreen} {...props} />
)

// connect to the redux store
const mapDispatchToProps = {
  showMobileSearchScreen: uiActions.showMobileSearchScreen
}

export default connect(null, mapDispatchToProps)(EditSearchButton)
