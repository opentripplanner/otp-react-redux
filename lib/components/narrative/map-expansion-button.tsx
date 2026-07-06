import { IntlShape } from 'react-intl'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { StyledIconWrapper } from '../util/styledIcon'

export const TOGGLE_MAP_BUTTON_HEIGHT = 5

const StyledMapExpansionButton = styled.button`
  align-items: center;
  background-color: transparent !important;
  display: flex;
  height: ${TOGGLE_MAP_BUTTON_HEIGHT}vh;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
`

const UnicodeChevron = styled.div<{ expanded: boolean }>`
  transform: rotate(${(props) => (props.expanded ? '270' : '90')}deg) scaleY(2)
    scaleX(1.5);
`

const MapExpansionButton = ({
  intl,
  mapExpanded,
  onClickExpansionButton
}: {
  intl: IntlShape
  mapExpanded: boolean
  onClickExpansionButton: () => void
}): JSX.Element => {
  const mapExpansionText = useMemo(() => {
    return mapExpanded
      ? intl.formatMessage({
          id: 'components.BatchResultsScreen.showResults'
        })
      : intl.formatMessage({
          id: 'components.BatchResultsScreen.expandMap'
        })
  }, [intl, mapExpanded])
  return (
    <StyledMapExpansionButton
      aria-label={mapExpansionText}
      // CSS classes 'base-color-bg' and 'itinerary' let us set the chevron color to the
      // same color as the color used the H3 headings over the narrative background.
      className="clear-button-formatting base-color-bg itinerary"
      onClick={onClickExpansionButton}
      title={mapExpansionText}
    >
      <StyledIconWrapper style={{ marginTop: '3px' }}>
        <UnicodeChevron expanded={mapExpanded}>&#10095;</UnicodeChevron>
      </StyledIconWrapper>
    </StyledMapExpansionButton>
  )
}

export default MapExpansionButton
