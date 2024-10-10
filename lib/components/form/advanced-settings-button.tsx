import { Gear } from '@styled-icons/fa-solid'
import { useIntl } from 'react-intl'

import { Button } from './batch-styled'
import { grey } from '../util/colors'
import React from 'react'
import styled from 'styled-components'

interface Props {
  onClick: () => void
}

const StyledAdvancedSettingsButton = styled(Button)`
  border: 2px solid ${grey[700]};
  color: ${grey[700]};
  background: white;
`

const AdvancedSettingsButton = ({ onClick }: Props): JSX.Element => {
  const intl = useIntl()

  const label = intl.formatMessage({
    id: 'components.BatchSearchScreen.moreOptions'
  })

  return (
    <StyledAdvancedSettingsButton
      aria-label={label}
      id="open-advanced-settings-button"
      onClick={onClick}
      title={label}
    >
      <Gear size={30} />
    </StyledAdvancedSettingsButton>
  )
}

export default AdvancedSettingsButton
