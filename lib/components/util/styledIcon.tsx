import { StyledIconBase } from '@styled-icons/styled-icon'
import styled from 'styled-components'

interface Props {
  spaceRight: boolean
}

const StyledIconWrapper = styled.span<Props>`
  top: 0.125em;
  position: relative;
  display: inline-flex;
  align-self: center;
  ${StyledIconBase} {
    width: 1em;
    height: 1em;
    top: 0.0125em;
    position: relative;
    margin: 0 0.125em;
  }
  margin: ${(props) => (props.spaceRight ? '0 0.125em' : '0 0')};
`

export default StyledIconWrapper
