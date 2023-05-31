import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component, MouseEvent, ReactElement } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { GRAY_ON_WHITE } from '../util/colors'

import { SequentialPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

export interface PaneProps<T = any> {
  disableNext?: boolean
  id: string
  onNext?: () => void
  pane: any
  props?: T
  title: ReactElement
}

interface OwnProps {
  activePaneId: string
  panes: PaneProps[]
}

interface Props extends OwnProps {
  activePane: PaneProps
  activePaneIndex: number
  parentPath: string
  routeTo: (url: any) => void
}

const StepNumber = styled.p`
  color: ${GRAY_ON_WHITE};
  font-size: 40%;
  margin: -1em 0 0 0;
`

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
class SequentialPaneDisplay extends Component<Props> {
  /**
   * Routes to the next pane URL.
   */
  _routeTo = (nextId: string) => {
    const { parentPath, routeTo } = this.props
    routeTo(`${parentPath}/${nextId}`)
  }

  _handleToNextPane = async (e: MouseEvent<Button>) => {
    const { activePane, activePaneIndex, panes } = this.props
    const { disableNext } = activePane

    if (activePaneIndex < panes.length - 1) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      if (disableNext) {
        alert('FIXME: Please check that your input is correct and try again.')
      } else {
        const nextId = panes[activePaneIndex + 1].id
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
    const { activePaneIndex, panes } = this.props
    if (activePaneIndex > 0) {
      const prevId = panes[activePaneIndex - 1].id
      prevId && this._routeTo(prevId)
    }
  }

  render() {
    const { activePane, activePaneIndex, panes } = this.props
    const { pane: Pane, props, title } = activePane || {}

    return (
      <>
        <h1>
          <StepNumber>
            <FormattedMessage
              id="components.SequentialPaneDisplay.stepNumber"
              values={{
                step: activePaneIndex + 1,
                total: panes.length
              }}
            />
          </StepNumber>
          {title}
        </h1>
        <SequentialPaneContainer>
          {Pane && <Pane {...props} />}
        </SequentialPaneContainer>
        <FormNavigationButtons
          backButton={
            activePaneIndex > 0
              ? {
                  onClick: this._handleToPrevPane,
                  text: <FormattedMessage id="common.forms.back" />
                }
              : undefined
          }
          okayButton={{
            onClick: this._handleToNextPane,
            text:
              activePaneIndex < panes.length - 1 ? (
                <FormattedMessage id="common.forms.next" />
              ) : (
                <FormattedMessage id="common.forms.finish" />
              ),
            type: 'submit'
          }}
        />
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: any, ownProps: OwnProps) => {
  const { activePaneId, panes } = ownProps
  const { pathname } = state.router.location
  const activePaneIndex = panes.findIndex((pane) => pane.id === activePaneId)
  return {
    activePane: panes[activePaneIndex],
    activePaneIndex,
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
