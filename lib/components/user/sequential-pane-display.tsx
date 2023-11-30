import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component, MouseEvent, ReactNode } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { grey } from '@opentripplanner/building-blocks'

import { SequentialPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

export interface PaneProps {
  id: string
  invalid?: boolean
  invalidMessage?: string
  onNext?: () => void
  pane: any
  title: ReactNode
}

interface OwnProps {
  activePaneId: string
  onFinish?: () => void
  panes: PaneProps[]
}

interface Props<T> extends OwnProps {
  activePane: PaneProps
  activePaneIndex: number
  paneProps: T
  parentPath: string
  routeTo: (url: any) => void
}

const StepNumber = styled.p`
  color: ${grey[700]};
  font-size: 40%;
  margin: -1em 0 0 0;
`

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
class SequentialPaneDisplay<T> extends Component<Props<T>> {
  /**
   * Routes to the next pane URL.
   */
  _routeTo = (nextId: string) => {
    const { parentPath, routeTo } = this.props
    routeTo(`${parentPath}/${nextId}`)
  }

  h1Ref = React.createRef<HTMLHeadingElement>()

  _focusHeader = () => {
    this.h1Ref?.current?.focus()
  }

  _handleToNextPane = async (e: MouseEvent<Button>) => {
    const { activePane, activePaneIndex, onFinish, panes } = this.props
    const { invalid, invalidMessage } = activePane

    if (activePaneIndex < panes.length - 1) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      if (invalid) {
        alert(invalidMessage)
      } else {
        const nextId = panes[activePaneIndex + 1].id
        // Execute pane-specific action, if any (e.g. save a user account)
        // when clicking next.
        if (typeof activePane.onNext === 'function') {
          await activePane.onNext()
        }
        this._routeTo(nextId)
      }
      this._focusHeader()
    } else if (onFinish) {
      onFinish()
    }
  }

  _handleToPrevPane = () => {
    const { activePaneIndex, panes } = this.props
    if (activePaneIndex > 0) {
      const prevId = panes[activePaneIndex - 1].id
      prevId && this._routeTo(prevId)
    }
    this._focusHeader()
  }

  componentDidMount(): void {
    this._focusHeader()
  }

  render() {
    const { activePane, activePaneIndex, paneProps, panes } = this.props
    const { pane: Pane, title } = activePane || {}

    return (
      <>
        <h1 aria-live="assertive" ref={this.h1Ref} tabIndex={-1}>
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
          {Pane && <Pane {...paneProps} />}
        </SequentialPaneContainer>
        <FormNavigationButtons
          backButton={
            activePaneIndex > 0 && {
              onClick: this._handleToPrevPane,
              text: <FormattedMessage id="common.forms.back" />
            }
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
  const activePaneIndex = panes.findIndex(
    (pane: PaneProps) => pane.id === activePaneId
  )
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
