import styled, { css } from 'styled-components'

export const invisibleCss = css`
  clip: rect(0, 0, 0, 0);
  height: 0;
  overflow: hidden;
  width: 0;
`

const InvisibleA11yLabel = styled.span<{ as?: string }>`
  ${(props) => {
    // Only set display:inline-block for spans.
    // If the tag type is overwritten, use that tag's display type.
    return props.as ? '' : 'display: inline-block;'
  }}
  ${invisibleCss}
`

export default InvisibleA11yLabel
