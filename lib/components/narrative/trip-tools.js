/* eslint-disable no-case-declarations */
import { Button } from 'react-bootstrap'
import { Check } from '@styled-icons/fa-solid/Check'
import { Clipboard } from '@styled-icons/fa-solid/Clipboard'
import { connect } from 'react-redux'
import { Flag } from '@styled-icons/fa-solid/Flag'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Print } from '@styled-icons/fa-solid/Print'
import { StyledIconBase } from '@styled-icons/styled-icon'
import { Undo } from '@styled-icons/fa-solid/Undo'
import { withRouter } from 'react-router'
import bowser from 'bowser'
import copyToClipboard from 'copy-to-clipboard'
import PropTypes from 'prop-types'
import React, { Component, useContext, useMemo } from 'react'

import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { IconWithText } from '../util/styledIcon'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PopupTriggerText from '../app/popup-trigger-text'

// Copy URL Button

class CopyUrlButton extends Component {
  constructor(props) {
    super(props)
    this.state = { showCopied: false }
  }

  _resetState = () => this.setState({ showCopied: false })

  _onClick = () => {
    // If special routerId has been set in session storage, construct copy URL
    // for itinerary with #/start/ prefix to set routerId on page load.
    const routerId = window.sessionStorage.getItem('routerId')
    let url = window.location.href
    if (routerId) {
      const parts = url.split('#')
      if (parts.length === 2) {
        url = `${parts[0]}#/start/x/x/x/${routerId}${parts[1]}`
      } else {
        // Console logs are not internationalized.
        console.warn(
          'URL not formatted as expected, copied URL will not contain session routerId.',
          routerId
        )
      }
    }
    copyToClipboard(url)
    this.setState({ showCopied: true })
    window.setTimeout(this._resetState, 2000)
  }

  render() {
    return (
      <div>
        {/* Announces copy button status to AT */}
        <InvisibleA11yLabel aria-live="assertive">
          {this.state.showCopied && (
            <FormattedMessage id="components.TripTools.linkCopied" />
          )}
        </InvisibleA11yLabel>
        <Button className="tool-button" onClick={this._onClick}>
          {this.state.showCopied ? (
            <span>
              <IconWithText Icon={Check}>
                <FormattedMessage id="components.TripTools.linkCopied" />
              </IconWithText>
            </span>
          ) : (
            <span>
              <IconWithText Icon={Clipboard}>
                <FormattedMessage id="components.TripTools.copyLink" />
              </IconWithText>
            </span>
          )}
        </Button>
      </div>
    )
  }
}

// Print Button Component

class PrintButton extends Component {
  _onClick = () => {
    // Note: this is designed to work only with hash routing.
    const printUrl = window.location.href.replace('#', '#/print')
    window.location = printUrl
  }

  render() {
    return (
      <div>
        <Button className="tool-button" onClick={this._onClick} role="link">
          <IconWithText Icon={Print}>
            <FormattedMessage id="common.forms.print" />
          </IconWithText>
        </Button>
      </div>
    )
  }
}

// Report Issue Button Component

class ReportIssueButtonBase extends Component {
  _onClick = () => {
    const { intl, mailto, subject: configuredSubject } = this.props
    const subject =
      configuredSubject ||
      intl.formatMessage({ id: 'components.TripTools.reportEmailSubject' })
    const bodyLines = [
      intl.formatMessage({ id: 'components.TripTools.reportEmailTemplate' }),
      '',
      // Search data section is for support and is not translated.
      'SEARCH DATA:',
      'Address: ' + window.location.href,
      'Browser: ' + bowser.name + ' ' + bowser.version,
      'OS: ' + bowser.osname + ' ' + bowser.osversion,
      ''
    ]

    window.open(
      `mailto:${mailto}?subject=${subject}&body=${encodeURIComponent(
        bodyLines.join('\n')
      )}`,
      '_self'
    )
  }

  render() {
    return (
      <Button className="tool-button" onClick={this._onClick}>
        <IconWithText Icon={Flag}>
          {/* FIXME: Depending on translation, Spanish and French strings may not fit in button width. */}
          <FormattedMessage id="components.TripTools.reportIssue" />
        </IconWithText>
      </Button>
    )
  }
}

ReportIssueButtonBase.propTypes = {
  intl: PropTypes.object,
  mailto: PropTypes.string,
  subject: PropTypes.string
}

// The ReportIssueButton component above, with an intl prop
// for retrieving messages shown outside of React rendering.
const ReportIssueButton = injectIntl(ReportIssueButtonBase)

// Link to URL Button

class LinkButton extends Component {
  _onClick = () => {
    window.location.href = this.props.url
  }

  render() {
    const { Icon, onClick, text } = this.props
    return (
      <div>
        <Button
          className="tool-button"
          onClick={onClick || this._onClick}
          role="link"
        >
          <IconWithText Icon={Icon}>{text}</IconWithText>
        </Button>
      </div>
    )
  }
}

LinkButton.propTypes = {
  Icon: PropTypes.elementType,
  onClick: PropTypes.func,
  text: PropTypes.element,
  url: PropTypes.string
}

const TripTools = ({
  buttonTypes,
  popupTarget,
  reportConfig,
  setPopupContent,
  startOverFromInitialUrl
}) => {
  const { SvgIcon } = useContext(ComponentContext)
  const PopupIcon = useMemo(() => {
    const IconComponent = (componentProps) => {
      return (
        <StyledIconBase>
          <SvgIcon iconName={popupTarget} {...componentProps} />
        </StyledIconBase>
      )
    }
    return IconComponent
  }, [SvgIcon, popupTarget])

  const buttonComponents = []
  buttonTypes.forEach((type) => {
    switch (type) {
      case 'COPY_URL':
        buttonComponents.push(<CopyUrlButton />)
        break
      case 'PRINT':
        buttonComponents.push(<PrintButton />)
        break
      case 'REPORT_ISSUE':
        if (reportConfig && reportConfig.mailto) {
          buttonComponents.push(<ReportIssueButton {...reportConfig} />)
        }
        break
      case 'START_OVER':
        buttonComponents.push(
          <LinkButton
            Icon={Undo}
            onClick={() => startOverFromInitialUrl()}
            text={<FormattedMessage id="common.forms.startOver" />}
          />
        )
        break
      case 'POPUP_LINK':
        if (popupTarget) {
          buttonComponents.push(
            <LinkButton
              Icon={PopupIcon}
              onClick={() => setPopupContent(popupTarget)}
              text={<PopupTriggerText compact popupTarget={popupTarget} />}
            />
          )
        }
        break
      default:
        console.warn(`TripTools called with invalid button type ${type}!`)
    }
  })

  return (
    <div className="trip-tools-container">
      <h2>
        <FormattedMessage id="components.TripTools.header" />
      </h2>
      <div className="trip-tools">
        {buttonComponents.map((btn, i) => (
          <div className="button-container" key={i}>
            {btn}
          </div>
        ))}
      </div>
    </div>
  )
}

TripTools.propTypes = {
  buttonTypes: PropTypes.arrayOf(PropTypes.string),
  popupTarget: PropTypes.string,
  reportConfig: PropTypes.object,
  setPopupContent: PropTypes.func,
  startOverFromInitialUrl: PropTypes.func
}

TripTools.defaultProps = {
  buttonTypes: ['COPY_URL', 'PRINT', 'REPORT_ISSUE', 'START_OVER', 'POPUP_LINK']
}

// Connect main class to redux store

const mapStateToProps = (state) => {
  return {
    popupTarget: state.otp.config?.popups?.launchers?.itineraryFooter,
    reportConfig: state.otp.config.reportIssue
  }
}
const mapDispatchToProps = {
  setPopupContent: uiActions.setPopupContent,
  startOverFromInitialUrl: uiActions.startOverFromInitialUrl
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TripTools)
)
