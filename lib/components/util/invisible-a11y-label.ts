import styled from 'styled-components'

const InvisibleA11yLabel = styled.span<{ as?: string }>`
  ${(props) => {
    // Only set display:inline-block for spans.
    // If the tag type is overwritten, use that tag's display type.
    return props.as ? '' : 'display: inline-block;'
  }}
  height: 0;
  overflow: hidden;
  width: 0;
`

export default InvisibleA11yLabel
