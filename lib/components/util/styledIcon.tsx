import { StyledIconBase } from '@styled-icons/styled-icon'
import styled from 'styled-components'

interface Props {
  flipHorizontal?: boolean
  size?: string
  spaceRight?: boolean
}

const getFontSize = (size?: string) => {
  switch (size) {
    case '2x':
      return '2em'
    case '3x':
      return '3em'
    case '4x':
      return '4em'
    default:
      return 'inherit'
  }
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
    font-size: ${(props) => getFontSize(props.size)};
    transform: ${(props) => (props.flipHorizontal ? 'scale(-1,1)' : '')};
  }
  margin: ${(props) => (props.spaceRight ? '0 0.125em' : '0 0')};
`

export default StyledIconWrapper
