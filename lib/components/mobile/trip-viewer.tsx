import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../actions/ui'
import DefaultMap from '../map/default-map'
import TripViewer from '../viewers/trip-viewer'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

interface Props {
  setViewedTrip: (payload: { tripId: string } | null) => void
}

const MobileTripViewer = ({ setViewedTrip }: Props) => {
  const intl = useIntl()
  return (
    <MobileContainer>
      <MobileNavigationBar
        headerText={intl.formatMessage({ id: 'components.TripViewer.header' })}
        onBackClicked={useCallback(() => setViewedTrip(null), [setViewedTrip])}
      />
      <main tabIndex={-1}>
        <div className="viewer-container">
          <TripViewer hideBackButton />
        </div>

        {/* The map is less important semantically, so keyboard focus and screen readers
            will focus on the route viewer first. The map will still appear first visually. */}
        <div className="viewer-map">
          <DefaultMap />
        </div>
      </main>
    </MobileContainer>
  )
}

// connect to the redux store

const mapDispatchToProps = {
  setViewedTrip: uiActions.setViewedTrip
}

export default connect(null, mapDispatchToProps)(MobileTripViewer)
