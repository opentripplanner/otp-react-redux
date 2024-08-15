import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Form, FormikProps } from 'formik'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { push, replace } from 'connected-react-router'
import React, { Component, MouseEvent } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { GREY_ON_WHITE } from '../util/colors'
import PageTitle from '../util/page-title'

import { EditedUser } from './types'
import { SequentialPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'
import standardPanes, { PaneProps } from './standard-panes'

export interface WizardProps {
  formikProps: FormikProps<EditedUser>
}

export interface OwnProps {
  pages: string[]
}

interface Props extends OwnProps, WizardProps {
  activePane: PaneProps
  activePaneIndex: number
  intl: IntlShape
  onNext?: (currentPage: string) => void
  parentPath: string
  returnTo?: string
  routeTo: (url: string, replace?: string, method?: any) => void
  title: string
}

const StepNumber = styled.p`
  color: ${GREY_ON_WHITE};
  font-size: 40%;
  margin: -1em 0 0 0;
`

/**
 * Basic component to build wizards (step-by-step forms).
 */
class Wizard extends Component<Props> {
  /**
   * Routes to the next pane URL.
   */
  _routeTo = (nextId: string, method = push) => {
    const { parentPath, routeTo } = this.props
    routeTo(`${parentPath}/${nextId}`, undefined, method)
  }

  h1Ref = React.createRef<HTMLHeadingElement>()

  _focusHeader = () => {
    this.h1Ref?.current?.focus()
  }

  _handleToNextPane = async (e: MouseEvent<Button>) => {
    const {
      activePane,
      activePaneIndex,
      formikProps,
      intl,
      onNext,
      pages,
      returnTo = '/',
      routeTo
    } = this.props

    if (activePaneIndex < pages.length - 1) {
      // Don't submit the form if there are more steps to complete.
      e.preventDefault()

      const {
        getInvalidMessage = (intl: IntlShape) => '',
        isInvalid = () => false
      } = activePane
      if (isInvalid(formikProps.values)) {
        alert(getInvalidMessage(intl))
      } else {
        const nextId = pages[activePaneIndex + 1]
        // Execute any action that need to happen before going to the next pane
        // (e.g. save a user account).
        if (onNext) {
          await onNext(pages[activePaneIndex])
        }
        this._routeTo(nextId)
      }
    } else {
      // Display a toast to acknowledge saved changes
      // (although in reality, changes quietly took effect in previous screens).
      toast.success(intl.formatMessage({ id: 'actions.user.preferencesSaved' }))
      routeTo(returnTo)
    }
  }

  _handleToPrevPane = () => {
    const { activePaneIndex, pages } = this.props
    if (activePaneIndex > 0) {
      const prevId = pages[activePaneIndex - 1]
      prevId && this._routeTo(prevId)
    }
  }

  componentDidMount(): void {
    const { activePaneIndex, pages } = this.props
    this._focusHeader()
    if (activePaneIndex === -1) {
      this._routeTo(pages[0], replace)
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.activePane !== this.props.activePane) {
      this._focusHeader()
    }
  }

  render() {
    const { activePane, activePaneIndex, formikProps, pages, title } =
      this.props
    const {
      backButton: BackButton,
      pane: Pane,
      title: paneTitle
    } = activePane || {}

    return (
      <Form id="user-settings-form" noValidate>
        <PageTitle title={title} />
        <h1 ref={this.h1Ref} tabIndex={-1}>
          <StepNumber>
            <FormattedMessage
              id="components.SequentialPaneDisplay.stepNumber"
              values={{
                step: activePaneIndex + 1,
                total: pages.length
              }}
            />
          </StepNumber>
          {paneTitle}
        </h1>
        <SequentialPaneContainer>
          {Pane && <Pane {...formikProps} />}
        </SequentialPaneContainer>
        <FormNavigationButtons
          backButton={
            (BackButton && {
              content: <BackButton />
            }) ||
            (activePaneIndex > 0 && {
              onClick: this._handleToPrevPane,
              text: <FormattedMessage id="common.forms.back" />
            })
          }
          okayButton={{
            onClick: this._handleToNextPane,
            text:
              activePaneIndex < pages.length - 1 ? (
                <FormattedMessage id="common.forms.next" />
              ) : (
                <FormattedMessage id="common.forms.finish" />
              ),
            type: 'submit'
          }}
        />
      </Form>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const { pages } = ownProps
  const { pathname } = state.router.location
  const lastSlashIndex = pathname.lastIndexOf('/')
  const activePaneId = pathname.substr(
    Math.min(lastSlashIndex + 1, pathname.length)
  )
  const activePaneIndex = pages.indexOf(activePaneId)
  return {
    // This, instead of just standardPages[activePaneId], ensures no "foreign" page is accidentally shown.
    activePane: standardPanes[pages[activePaneIndex]],
    activePaneIndex,
    parentPath: pathname.substr(0, lastSlashIndex)
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Wizard))
