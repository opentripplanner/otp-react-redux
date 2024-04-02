import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Star as StarRegular } from '@styled-icons/fa-regular/Star'
import { Star as StarSolid } from '@styled-icons/fa-solid/Star'
import React, { useCallback } from 'react'

import * as userActions from '../../actions/user'
import { AppReduxState } from '../../util/state-types'
import { getPersistenceMode } from '../../util/user'
import { getShowUserSettings } from '../../util/state'
import { StopData } from '../util/types'
import { StyledIconWrapper } from '../util/styledIcon'

interface OwnProps {
  stopData?: StopData
}

interface Props extends OwnProps {
  enableFavoriteStops: boolean
  forgetStop: (stopData: StopData) => void
  isFavoriteStop: boolean
  rememberStop: (stopData: StopData) => void
}

/**
 * Renders a clickable star to indicate/mark a stop as favorite.
 */
const FavoriteStopToggle = ({
  enableFavoriteStops,
  forgetStop,
  isFavoriteStop,
  rememberStop,
  stopData
}: Props): JSX.Element | null => {
  const handleClick = useCallback(() => {
    if (stopData) {
      if (isFavoriteStop) forgetStop(stopData)
      else rememberStop(stopData)
    }
  }, [forgetStop, isFavoriteStop, rememberStop, stopData])

  return enableFavoriteStops ? (
    <Button
      bsSize="large"
      bsStyle="link"
      onClick={handleClick}
      style={{
        color: isFavoriteStop ? 'yellow' : 'black',
        marginLeft: '5px',
        padding: 0
      }}
    >
      <StyledIconWrapper>
        {isFavoriteStop ? <StarSolid /> : <StarRegular />}
      </StyledIconWrapper>
    </Button>
  ) : null
}

// connect to redux store

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const showUserSettings = getShowUserSettings(state)
  const { config } = state.otp
  const { persistence } = config
  const stopId = ownProps.stopData?.gtfsId

  return {
    enableFavoriteStops:
      showUserSettings && getPersistenceMode(persistence).isLocalStorage,
    isFavoriteStop: state.user.localUser?.favoriteStops.some(
      (s: { id: string }) => s.id === stopId
    )
  }
}

const mapDispatchToProps = {
  forgetStop: userActions.forgetStop,
  rememberStop: userActions.rememberStop
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteStopToggle)
