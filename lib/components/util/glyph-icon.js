import {Glyphicon} from 'react-bootstrap'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const GlyphIconWithSpace = styled(Glyphicon)`
  &::after {
    content: "";
    margin: 0 0.125em;
  }
`

export const GlyphIcon = ({ glyph, withSpace, ...props }) => {
  const IconComponent = withSpace
    ? GlyphIconWithSpace
    : Glyphicon
  return (
    <IconComponent
      glyph={glyph}
      {...props}
    />
  )
}

GlyphIcon.propTypes = {
  glyph: PropTypes.string.isRequired,
  withSpace: PropTypes.bool
}

export default GlyphIcon
