import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'

import { switchLocations } from '../../actions/map'

function SwitchButton (props) {
  const intl = useIntl()

  const content = props.content ?? intl.formatMessage({id: 'components.SwitchButton.defaultContent'})

  return (
    <Button
      className='switch-button'
      onClick={props.onClick || props.switchLocations}
      title={intl.formatMessage({id: 'components.SwitchButton.switchLocations'})}
    >
      {content}
    </Button>
  )
}

SwitchButton.propTypes = {
  onClick: PropTypes.func,
  switchLocations: PropTypes.func
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    switchLocations: () => { dispatch(switchLocations()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButton)
