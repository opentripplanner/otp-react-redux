import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { FormikProps } from 'formik'
import React, { Component, MouseEvent, ReactNode } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { GRAY_ON_WHITE } from '../util/colors'

import { SequentialPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

export interface PaneProps {
  getInvalidMessage?: (intl: IntlShape) => string
  id: string
  isInvalid?: (arg: any) => boolean
  onNext?: () => void
  pane: any
  title: ReactNode
}

interface OwnProps {
  activePaneId: string
  onFinish?: () => void
  panes: PaneProps[]
}

interface Props extends OwnProps {
  activePane: PaneProps
  activePaneIndex: number
  intl: IntlShape
  paneProps: FormikProps<any>
  panes: PaneProps[]
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

  h1Ref = React.createRef<HTMLHeadingElement>()

  _focusHeader = () => {
    this.h1Ref?.current?.focus()
  }

  _handleToNextPane = async (e: MouseEvent<Button>) => {
    const { activePane, activePaneIndex, intl, onFinish, paneProps, panes } =
      this.props
    const {
      getInvalidMessage = (intl: IntlShape) => '',
      isInvalid = () => false
    } = activePane

    if (activePaneIndex < panes.length - 1) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      if (isInvalid(paneProps.values)) {
        alert(getInvalidMessage(intl))
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

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
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
)(injectIntl(SequentialPaneDisplay))
