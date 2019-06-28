import React from 'react'

import BikeIcon from './bike-icon'
import BiketownIcon from './biketown-icon'
import BusIcon from './bus-icon'
import Car2goIcon from './car2go-icon'
import ReachNowIcon from './reachnow-icon'
import GondolaIcon from './gondola-icon'
import LyftIcon from './lyft-icon'
import RailIcon from './rail-icon'
import StreetcarIcon from './streetcar-icon'
import TramIcon from './tram-icon'
import TransitIcon from './transit-icon'
import UberIcon from './uber-icon'
import WalkIcon from './walk-icon'

// define Portland-specific mode icons
export default {
  BICYCLE: <BikeIcon />,
  BICYCLE_RENT: <BiketownIcon />,
  BUS: <BusIcon />,
  CAR_HAIL_LYFT: <LyftIcon />,
  CAR_HAIL_UBER: <UberIcon />,
  CAR_RENT_CAR2GO: <Car2goIcon />,
  CAR_RENT_REACHNOW: <ReachNowIcon />,
  GONDOLA: <GondolaIcon />,
  RAIL: <RailIcon />,
  STREETCAR: <StreetcarIcon />,
  TRAM: <TramIcon />,
  TRANSIT: <TransitIcon />,
  WALK: <WalkIcon />,
  customModeForLeg: (leg) => {
    if (leg.routeLongName && leg.routeLongName.startsWith('Portland Streetcar')) return 'STREETCAR'
    return null
  }
}
