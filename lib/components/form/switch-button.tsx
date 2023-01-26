import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { ReactNode } from 'react'

import * as formActions from '../../actions/form'

interface Props {
  content?: ReactNode
  onClick?: () => void
  switchLocations: () => void
}

function SwitchButton({ content, onClick }: Props) {
  const intl = useIntl()

  const buttonContent =
    content ??
    intl.formatMessage({ id: 'components.SwitchButton.defaultContent' })

  return (
    <Button
      className="switch-button"
      onClick={props.onClick || props.switchLocations}
      title={intl.formatMessage({
        id: 'components.SwitchButton.switchLocations'
      })}
    >
      {buttonContent}
    </Button>
  )
}

const mapDispatchToProps = {
  switchLocations: formActions.switchLocations
}

export default connect(null, mapDispatchToProps)(SwitchButton)
