import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Button, DropdownButton, MenuItem } from 'react-bootstrap'
import copyToClipboard from 'copy-to-clipboard'
import bowser from 'bowser'

class TripTools extends Component {
  render () {
    const { reportConfig } = this.props

    const buttons = []

    buttons.push(<ShareSaveDropdownButton />)
    buttons.push(<PrintButton />)
    if (reportConfig && reportConfig.mailto) {
      buttons.push(
        <ReportIssueButton {...reportConfig} />
      )
    }

    return (
      <div className='trip-tools'>
        {buttons.map((btn, i) => {
          const classNames = ['button-container']
          if (i < buttons.length - 1) classNames.push('pad-right')
          return <div key={i} className={classNames.join(' ')}>{btn}</div>
        })}
      </div>
    )
  }
}

// Share/Save Dropdown Component

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

// Print Button Component

class PrintButton extends Component {
  _onClick = () => {
    const printUrl = window.location.href.split('?')[0] + 'print' + window.location.search
    window.open(printUrl, '_blank')
  }

  render () {
    return (
      <div>
        <Button
          className='tool-button'
          onClick={this._onClick}
        >
          <i className='fa fa-print' /> Print
        </Button>
      </div>
    )
  }
}

// Report Issue Button Component

class ReportIssueButton extends Component {
  static defaultProps = {
    subject: 'Reporting an Issue with OpenTripPlanner'
  }

  _onClick = () => {
    const { mailto, subject } = this.props

    const bodyLines = [
      '                       *** INSTRUCTIONS TO USER ***',
      'This feature allows you to email a report to site administrators for review.',
      `Please add any additional feedback for this trip under the 'Additional Comments'`,
      'section below and send using your regular email program.',
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
        <i className='fa fa-flag' /> Report Issue
      </Button>
    )
  }
}

// Connect main class to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    reportConfig: state.otp.config.reportIssue
  }
}

export default connect(mapStateToProps)(TripTools)
