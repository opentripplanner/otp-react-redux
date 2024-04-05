import { Route, Switch } from 'react-router'
import React, { useContext } from 'react'

import { ComponentContext } from '../../util/contexts'
import NearbyView from '../viewers/nearby/nearby-view'
import PatternViewer from '../viewers/pattern-viewer'
import RouteViewer from '../viewers/route-viewer'
import StopScheduleViewer from '../viewers/stop-schedule-viewer'
import TripViewer from '../viewers/trip-viewer'

const MainPanel = (): JSX.Element => {
  // @ts-expect-error No type on ComponentContext
  const { MainPanel: ConfigMainPanel } = useContext(ComponentContext)
  return (
    <Switch>
      <Route exact path={['/nearby', '/nearby/:latLon', '/stop', '/stop/:id']}>
        <NearbyView hideBackButton />
      </Route>
      <Route exact path={['/schedule', '/schedule/:id']}>
        <StopScheduleViewer hideBackButton />
      </Route>
      <Route exact path="/route/:id/pattern/:patternId">
        <PatternViewer hideBackButton />
      </Route>
      <Route exact path={['/route', '/route/:id']}>
        <RouteViewer hideBackButton />
      </Route>
      <Route exact path="/trip/:id">
        <TripViewer hideBackButton />
      </Route>
      <Route exact path="/">
        <ConfigMainPanel />
      </Route>
    </Switch>
  )
}

export default MainPanel
