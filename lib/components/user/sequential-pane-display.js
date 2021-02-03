import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
import FormNavigationButtons from './form-navigation-buttons'
import { SequentialPaneContainer } from './styled'

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
class SequentialPaneDisplay extends Component {
  static propTypes = {
    activePaneId: PropTypes.string.isRequired,
    paneSequence: PropTypes.object.isRequired
  }

  /**
   * Routes to the next pane URL.
   */
  _routeTo = nextId => {
    const { parentPath, routeTo } = this.props
    routeTo(`${parentPath}/${nextId}`)
  }

  _handleToNextPane = async e => {
    const { activePane } = this.props
    const nextId = activePane.nextId

    if (nextId) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      // Execute pane-specific action, if any (e.g. save a user account)
      // when clicking next.
      if (typeof activePane.onNext === 'function') {
        await activePane.onNext()
      }
      this._routeTo(nextId)
    }
  }

  _handleToPrevPane = () => {
    const { activePane } = this.props
    this._routeTo(activePane.prevId)
  }

  render () {
    const { activePane = {} } = this.props
    const { disableNext, nextId, pane: Pane, prevId, props, title } = activePane

    return (
      <>
        <h1>{title}</h1>

        <SequentialPaneContainer>
          {Pane && <Pane {...props} />}
        </SequentialPaneContainer>

        <FormNavigationButtons
          backButton={prevId && {
            onClick: this._handleToPrevPane,
            text: 'Back'
          }}
          okayButton={{
            disabled: disableNext,
            onClick: this._handleToNextPane,
            text: nextId ? 'Next' : 'Finish',
            type: 'submit'
          }}
        />
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { activePaneId, paneSequence } = ownProps
  const { pathname } = state.router.location
  return {
    activePane: paneSequence[activePaneId],
    parentPath: pathname.substr(0, pathname.lastIndexOf('/'))
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(SequentialPaneDisplay)
