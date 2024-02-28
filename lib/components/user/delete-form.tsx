import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Trash } from '@styled-icons/fa-solid/Trash'
import React, { useState } from 'react'
import styled from 'styled-components'

import * as userActions from '../../actions/user'
import { IconWithText } from '../util/styledIcon'
import { InlineLoading } from '../narrative/loading'
import { red } from '@opentripplanner/building-blocks'

interface DeleteFormProps {
  confirmAndDeleteUserMonitoredTrip: (id: string, intl: any) => void
  tripId: string
}

const DeleteFormButton = styled(Button)`
  background-color: white;
  border-color: ${red[800]};
  color: ${red[800]};
  :active,
  :focus,
  :focus:active,
  :hover {
    border-color: ${red[800]};
    color: ${red[800]};
  }
  float: right;
  margin-right: 10px;
`

const DeleteForm: React.FC<DeleteFormProps> = ({
  confirmAndDeleteUserMonitoredTrip,
  tripId
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const intl = useIntl()

  const _handleDelete = async () => {
    setIsLoading(true)
    await confirmAndDeleteUserMonitoredTrip(tripId, intl)
    setIsLoading(false)
  }

  return (
    <DeleteFormButton disabled={isLoading} onClick={_handleDelete}>
      {isLoading ? (
        <InlineLoading />
      ) : (
        <IconWithText Icon={Trash}>
          <FormattedMessage id="components.SavedTripEditor.deleteSavedTrip" />
        </IconWithText>
      )}
    </DeleteFormButton>
  )
}

const mapDispatchToProps = {
  confirmAndDeleteUserMonitoredTrip:
    userActions.confirmAndDeleteUserMonitoredTrip
}
export default connect(null, mapDispatchToProps)(DeleteForm)
