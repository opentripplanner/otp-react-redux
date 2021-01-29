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
    const { currentPath, activePaneId, routeTo } = this.props
    routeTo(`${currentPath.replace(new RegExp(`/${activePaneId}$`), `/${nextId}`)}`)
  }

  _handleToNextPane = async e => {
    const { activePaneId, paneSequence } = this.props
    const currentPane = paneSequence[activePaneId]
    const nextId = currentPane.nextId

    if (nextId) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      // Execute pane-specific action, if any (e.g. save a user account)
      // when clicking next.
      if (typeof currentPane.onNext === 'function') {
        await currentPane.onNext()
      }
      this._routeTo(nextId)
    }
  }

  _handleToPrevPane = () => {
    const { activePaneId, paneSequence } = this.props
    const prevId = paneSequence[activePaneId].prevId
    this._routeTo(prevId)
  }

  render () {
    const { activePaneId, paneSequence } = this.props
    const activePane = paneSequence[activePaneId] || {}
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
  return {
    currentPath: state.router.location.pathname
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(SequentialPaneDisplay)
