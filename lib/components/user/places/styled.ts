import Link from '../../util/link'
import styled from 'styled-components'

import { GREY_ON_WHITE } from '../../util/colors'

import Place, {
  IconWrapper,
  PlaceButton,
  PlaceContainer,
  PlaceContent,
  PlaceDetail,
  PlaceName
} from './place'

// Styles and exports for favorite place components
// used in the My account page.

// const FAVORITE_PLACE_HEIGHT_PX = '60px'

export const StyledFavoritePlace = styled(Place).attrs({
  largeIcon: true
})`
  ${PlaceContainer} {
    text-align: left;
  }
  ${PlaceContent} {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    /* overflow is needed here for the nested overflow to take effect. */
    overflow: hidden;
  }
  ${PlaceDetail} {
    color: ${GREY_ON_WHITE};
  }

  ${PlaceName},
  ${PlaceDetail} {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
  ${IconWrapper} {
    color: ${GREY_ON_WHITE};
    flex-shrink: 0;
  }
`

// Styles and exports for the place component
// used in the main panel.

export const StyledMainPanelPlace = styled(Place)`
  ${PlaceButton} {
    border: none;
  }
  ${PlaceName} {
    margin-left: 0.25em;
  }
`

export const NewPlaceButton = styled(Link)`
  align-items: center;
  display: flex;
  margin-top: 15px;
  width: fit-content;
  gap: 10px;
`
