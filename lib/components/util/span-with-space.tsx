import styled from 'styled-components'

const SpanWithSpace = styled.span<{ margin: number }>`
  &::after {
    content: '';
    margin: 0 ${(props) => props.margin}em;
  }
`
export default SpanWithSpace
