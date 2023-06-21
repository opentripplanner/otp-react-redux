import { connect } from 'react-redux'
import React from 'react'

import { getActiveSearch } from '../../util/state'
import NarrativeItineraries from '../narrative/narrative-itineraries'

type Props = {
  activeSearch?: any
  mainPanelContent: number
}
const SecondaryBubbleRenderer = ({
  activeSearch,
  mainPanelContent
}: Props): JSX.Element => {
  if (activeSearch && mainPanelContent === null) {
    return (
      <div className="main-full secondary">
        <NarrativeItineraries />
      </div>
    )
  }
  return <></>
}

const mapStateToProps = (state: any) => {
  const { mainPanelContent } = state.otp.ui
  const activeSearch = getActiveSearch(state)

  return {
    activeSearch,
    mainPanelContent
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SecondaryBubbleRenderer)
