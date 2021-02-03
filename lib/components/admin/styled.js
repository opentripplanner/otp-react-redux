import { Button as BsButton } from 'react-bootstrap'
import styled, {css} from 'styled-components'

export const B = styled.strong``

export const Button = styled(BsButton)`
  margin-left: 5px;
`

export const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export const Half = styled.div`
  width: 50%
`

export const Full = styled.div`
  width: 100%
`

export const FullWithMargin = styled(Full)`
  margin-top: 10px;
`

export const Header = styled.h4`
  margin-bottom: 5px;
  width: 100%;
`

export const InlineHeader = styled(Header)`
  display: inline;
`

export const textCss = css`
  font-size: 0.9em;
  margin-bottom: 0px;
`

export const P = styled.p`
  ${textCss}
`

export const Text = styled.span`
  ${textCss}
`

export const Val = styled.span`
  :empty:before {
    color: grey;
    content: 'N/A';
  }
`
