import styled from 'styled-components'

import { GRAY_ON_WHITE } from '../../util/colors'

import Place, {
  ActionButton,
  ActionButtonPlaceholder,
  IconWrapper,
  PlaceButton,
  PlaceContent,
  PlaceDetail,
  PlaceLink,
  PlaceName
} from './place'

// Styles and exports for favorite place components
// used in the My account page.

const FAVORITE_PLACE_HEIGHT_PX = '60px'

export const StyledFavoritePlace = styled(Place).attrs({
  largeIcon: true
})`
  align-items: stretch;
  display: flex;
  height: ${FAVORITE_PLACE_HEIGHT_PX};
  margin-bottom: 10px;

  ${PlaceLink} {
    align-items: center;
    display: flex;
    flex: 1 0 0;
    text-align: left;
  }
  ${PlaceContent} {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    margin-left: 10px;
    /* overflow is needed here for the nested overflow to take effect. */
    overflow: hidden;
  }
  ${PlaceDetail} {
    color: ${GRAY_ON_WHITE};
  }

  ${PlaceName},
  ${PlaceDetail} {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  ${IconWrapper} {
    color: ${GRAY_ON_WHITE};
    flex-shrink: 0;
  }
  ${ActionButton}, ${ActionButtonPlaceholder} {
    margin-left: 4px;
    width: ${FAVORITE_PLACE_HEIGHT_PX};
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
  ${PlaceDetail} {
    display: block;
    height: 100%;
  }
  ${ActionButton} {
    border: none;
    width: 40px;
  }
`
