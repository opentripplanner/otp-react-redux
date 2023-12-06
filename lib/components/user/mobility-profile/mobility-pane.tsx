import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../../actions/ui'

interface Props {
  routeTo: (url: string) => void
}

/**
 * Renders a button to show the mobility profile settings.
 */
const MobilityPane = ({ routeTo }: Props): JSX.Element => {
  const handleClick = useCallback(() => {
    routeTo('/account/mobilityProfile/')
  }, [routeTo])
  return (
    <Button bsStyle="primary" onClick={handleClick}>
      <FormattedMessage id="components.MobilityProfile.title" />
    </Button>
  )
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(null, mapDispatchToProps)(MobilityPane)
