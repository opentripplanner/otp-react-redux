import { StyledIconBase } from '@styled-icons/styled-icon'
import styled, { keyframes } from 'styled-components'

interface Props {
  block?: boolean
  flipHorizontal?: boolean
  noMargin?: boolean
  rotate90?: boolean
  size?: string
  spaceAfter?: boolean
  spin?: boolean
  static?: boolean
}

const getFontSize = (size?: string) => {
  switch (size) {
    case '1.5x':
      return '1.5em'
    case '2x':
      return '2em'
    case '3x':
      return '3em'
    case '4x':
      return '4em'
    case '5x':
      return '5em'
    default:
      return 'inherit'
  }
}

const rotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const StyledIconWrapper = styled.span<Props>`
  top: 0.125em;
  position: ${(props) => (props.static ? 'static' : 'relative')};
  display: ${(props) => (props.block ? 'grid' : 'inline-grid')};
  grid-template-columns: auto auto;
  place-content: center;
  animation: ${(props) => (props.spin ? rotateAnimation : 'none')} 1.2s linear
    infinite;
  ${StyledIconBase} {
    width: 1em;
    height: 1em;
    margin: ${(props) => (props.noMargin ? '0' : '0 0.125em')};
    font-size: ${(props) => getFontSize(props.size)};
    transform: ${(props) => `
      ${props.flipHorizontal ? 'scale(-1,1) ' : ''}
      ${props.rotate90 ? 'rotate(90deg)' : ''}
      `};
  }
  &:after {
    margin: 0 ${(props) => (props.spaceAfter ? '0.125em' : '0')};
    content: '';
  }
`

export default StyledIconWrapper
