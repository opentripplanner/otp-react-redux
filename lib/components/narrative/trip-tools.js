import bowser from 'bowser'
import copyToClipboard from 'copy-to-clipboard'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
// import { DropdownButton, MenuItem } from 'react-bootstrap'
import { FormattedMessage, injectIntl } from 'react-intl'

class TripTools extends Component {
  static defaultProps = {
    buttonTypes: [ 'COPY_URL', 'PRINT', 'REPORT_ISSUE', 'START_OVER' ]
  }

  render () {
    const { buttonTypes, reactRouterConfig, reportConfig } = this.props

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
          if (!reportConfig || !reportConfig.mailto) break
          buttonComponents.push(<ReportIssueButton {...reportConfig} />)
          break
        case 'START_OVER':
          // Determine "home" URL
          let startOverUrl = '/'
          if (reactRouterConfig && reactRouterConfig.basename) {
            startOverUrl += reactRouterConfig.basename
          }
          buttonComponents.push(
            // FIXME: The Spanish string does not fit in button width.
            <LinkButton
              icon='undo'
              text={<FormattedMessage id='common.forms.startOver' />}
              url={startOverUrl}
            />
          )
          break
      }
    })

    return (
      <div className='trip-tools'>
        {buttonComponents.map((btn, i) => <div className='button-container' key={i}>{btn}</div>)}
      </div>
    )
  }
}

// Share/Save Dropdown Component -- not used currently

/*
class ShareSaveDropdownButton extends Component {
  _onCopyToClipboardClick = () => {
    copyToClipboard(window.location.href)
  }

  render () {
    return (
      <DropdownButton
        className='tool-button'
        title={<span><i className='fa fa-share' /> Share/Save</span>}
        id={'tool-share-dropdown'}
      >
        <MenuItem onClick={this._onCopyToClipboardClick}>
          <i className='fa fa-clipboard' /> Copy Link to Clipboard
        </MenuItem>
      </DropdownButton>
    )
  }
}
*/

// Copy URL Button

class CopyUrlButton extends Component {
  constructor (props) {
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
        console.warn('URL not formatted as expected, copied URL will not contain session routerId.', routerId)
      }
    }
    copyToClipboard(url)
    this.setState({ showCopied: true })
    window.setTimeout(this._resetState, 2000)
  }

  render () {
    return (
      <div>
        <Button
          className='tool-button'
          onClick={this._onClick}
        >
          {this.state.showCopied
            ? (
              <span>
                <i className='fa fa-check' />
                {' '}
                <FormattedMessage id='components.TripTools.linkCopied' />
              </span>
            )
            : (
              <span>
                <i className='fa fa-clipboard' />
                {' '}
                <FormattedMessage id='components.TripTools.copyLink' />
              </span>
            )
          }
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
    window.open(printUrl, '_blank')
  }

  render () {
    return (
      <div>
        <Button
          className='tool-button'
          onClick={this._onClick}
        >
          <i className='fa fa-print' />
          {' '}
          <FormattedMessage id='components.TripTools.print' />
        </Button>
      </div>
    )
  }
}

// Report Issue Button Component

class ReportIssueButtonBase extends Component {
  _onClick = () => {
    const { intl, mailto, subject: configuredSubject } = this.props
    const subject = configuredSubject || intl.formatMessage({id: 'components.TripTools.reportEmailSubject'})
    const bodyLines = [
      intl.formatMessage({id: 'components.TripTools.reportEmailTemplate'}),
      '',
      'SEARCH DATA:',
      'Address: ' + window.location.href,
      'Browser: ' + bowser.name + ' ' + bowser.version,
      'OS: ' + bowser.osname + ' ' + bowser.osversion,
      '',
      'ADDITIONAL COMMENTS:',
      ''
    ]

    window.open(`mailto:${mailto}?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`, '_self')
  }

  render () {
    return (
      <Button
        className='tool-button'
        onClick={this._onClick}
      >
        <i className='fa fa-flag' />
        {' '}
        {/* FIXME: The Spanish and French strings do not fit in button width. */}
        <FormattedMessage id='components.TripTools.reportIssue' />
      </Button>
    )
  }
}

// The ReportIssueButton component above, with an intl prop
// for retrieving messages shown outside of React rendering.
const ReportIssueButton = injectIntl(ReportIssueButtonBase)

// Link to URL Button

class LinkButton extends Component {
  _onClick = () => {
    window.location.href = this.props.url
  }

  render () {
    const { icon, text } = this.props
    return (
      <div>
        <Button
          className='tool-button'
          onClick={this._onClick}
        >
          {icon && <span><i className={`fa fa-${icon}`} /> </span>}
          {text}
        </Button>
      </div>
    )
  }
}

// Connect main class to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    reactRouterConfig: state.otp.config.reactRouter,
    reportConfig: state.otp.config.reportIssue
  }
}

export default connect(mapStateToProps)(TripTools)
