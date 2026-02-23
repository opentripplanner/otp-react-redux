import { Circle, withCaret } from '@opentripplanner/transit-vehicle-overlay'
import { useSelector } from 'react-redux'
import { VehicleComponentProps } from '@opentripplanner/transit-vehicle-overlay/lib/types'
import React, { HTMLAttributes } from 'react'

import { AppReduxState } from '../../util/state-types'

const ConnectedCaret = (
  props: HTMLAttributes<HTMLDivElement> & VehicleComponentProps
): JSX.Element => {
  const caretOptions = useSelector(
    (state: AppReduxState) => state.otp.config.routeViewer?.vehicleIconCaret
  )

  const CaretTouchingBorder = withCaret(Circle, {
    height: 5,
    offset: 1.5,
    width: 10,
    ...caretOptions
  })

  return <CaretTouchingBorder {...props} />
}

export default ConnectedCaret
