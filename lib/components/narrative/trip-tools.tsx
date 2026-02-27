import { Button } from 'react-bootstrap'
import { Check } from '@styled-icons/fa-solid/Check'
import { Clipboard } from '@styled-icons/fa-solid/Clipboard'
import { connect } from 'react-redux'
import { Flag } from '@styled-icons/fa-solid/Flag'
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl'
import { Print } from '@styled-icons/fa-solid/Print'
import { Undo } from '@styled-icons/fa-solid/Undo'
import bowser from 'bowser'
import copyToClipboard from 'copy-to-clipboard'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'
import React, {
  Component,
  ComponentType,
  CSSProperties,
  ReactNode,
  SVGProps,
  useContext,
  useMemo
} from 'react'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { getModuleConfig, Modules } from '../../util/config'
import { IconWithText } from '../util/styledIcon'
import { ReportIssueConfig } from '../../util/config-types'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PopupTriggerText from '../app/popup-trigger-text'

// Copy URL Button

interface CopyUrlButtonProps {
  copyItineraryUrl?: string
}

interface CopyUrlButtonState {
  showCopied: boolean
}

class CopyUrlButton extends Component<CopyUrlButtonProps, CopyUrlButtonState> {
  constructor(props: CopyUrlButtonProps) {
    super(props)
    this.state = { showCopied: false }
  }

  _resetState = () => this.setState({ showCopied: false })

  _onClick = () => {
    let url = window.location.href
    if (this.props.copyItineraryUrl) {
      // Copy query params without sessionId.
      const params = { ...coreUtils.query.getUrlParams(), sessionId: undefined }
      url = `${this.props.copyItineraryUrl}/#/?${qs.stringify(params)}`
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
    window.location.href = printUrl
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

class ReportIssueButtonBase extends Component<
  ReportIssueConfig & WrappedComponentProps
> {
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
          <FormattedMessage id="components.TripTools.reportIssue" />
        </IconWithText>
      </Button>
    )
  }
}

// The ReportIssueButton component above, with an intl prop
// for retrieving messages shown outside of React rendering.
const ReportIssueButton = injectIntl(ReportIssueButtonBase)

// Link to URL Button

interface LinkButtonProps {
  Icon: ComponentType
  onClick: () => void
  text: ReactNode
  url?: string
}

class LinkButton extends Component<LinkButtonProps> {
  _onClick = () => {
    this.props.url && (window.location.href = this.props.url)
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

interface TripToolsProps {
  buttonTypes?: string[]
  copyItineraryUrl?: string
  popupTarget?: string
  reportConfig?: ReportIssueConfig
  setPopupContent: (target: string) => void
  startOverFromInitialUrl: () => void
}

// FIXME: Combine with the same type from app.js when converting that to TS.
interface SvgIconProps {
  Fallback?: unknown
  className?: string
  iconName?: string
  style?: CSSProperties
}

const TripTools = ({
  buttonTypes = [
    'COPY_URL',
    'PRINT',
    'REPORT_ISSUE',
    'START_OVER',
    'POPUP_LINK'
  ],
  copyItineraryUrl,
  popupTarget,
  reportConfig,
  setPopupContent,
  startOverFromInitialUrl
}: TripToolsProps) => {
  const { SvgIcon } = useContext(ComponentContext) as {
    SvgIcon: ComponentType<SvgIconProps>
  }
  const PopupIcon = useMemo(() => {
    const IconComponent = (componentProps: SVGProps<SVGSVGElement>) => (
      <SvgIcon iconName={popupTarget} {...componentProps} />
    )
    return IconComponent
  }, [SvgIcon, popupTarget])

  const buttonComponents = [] as ReactNode[]
  buttonTypes.forEach((type) => {
    switch (type) {
      case 'COPY_URL':
        buttonComponents.push(
          <CopyUrlButton copyItineraryUrl={copyItineraryUrl} />
        )
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

// Connect main class to redux store

const mapStateToProps = (state: AppReduxState) => {
  const callTakerConfig = getModuleConfig(state, Modules.CALL_TAKER)
  return {
    copyItineraryUrl: callTakerConfig?.options?.copyItineraryUrl,
    popupTarget: state.otp.config?.popups?.launchers?.itineraryFooter,
    reportConfig: state.otp.config.reportIssue
  }
}
const mapDispatchToProps = {
  setPopupContent: uiActions.setPopupContent,
  startOverFromInitialUrl: uiActions.startOverFromInitialUrl
}

export default connect(mapStateToProps, mapDispatchToProps)(TripTools)
