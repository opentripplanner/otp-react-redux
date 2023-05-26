/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'

import { SequentialPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

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
  _routeTo = (nextId) => {
    const { parentPath, routeTo } = this.props
    routeTo(`${parentPath}/${nextId}`)
  }

  _handleToNextPane = async (e) => {
    const { activePane } = this.props
    const { disableNext, nextId } = activePane

    if (nextId) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      if (disableNext) {
        alert('FIXME: Please check that your input is correct and try again.')
      } else {
        // Execute pane-specific action, if any (e.g. save a user account)
        // when clicking next.
        if (typeof activePane.onNext === 'function') {
          await activePane.onNext()
        }
        this._routeTo(nextId)
      }
    }
  }

  _handleToPrevPane = () => {
    const { activePane } = this.props
    this._routeTo(activePane.prevId)
  }

  render() {
    const { activePane = {} } = this.props
    const {
      hideNavigation,
      nextId,
      pane: Pane,
      prevId,
      props,
      title
    } = activePane

    return (
      <>
        <h1>{title}</h1>

        <SequentialPaneContainer>
          {Pane && <Pane {...props} />}
        </SequentialPaneContainer>

        {!hideNavigation && (
          <FormNavigationButtons
            backButton={
              prevId && {
                onClick: this._handleToPrevPane,
                text: <FormattedMessage id="common.forms.back" />
              }
            }
            okayButton={{
              onClick: this._handleToNextPane,
              text: nextId ? (
                <FormattedMessage id="common.forms.next" />
              ) : (
                <FormattedMessage id="common.forms.finish" />
              ),
              type: 'submit'
            }}
          />
        )}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SequentialPaneDisplay)
