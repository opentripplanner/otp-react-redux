import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
// @ts-expect-error icons doesn't have typescript?
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import { IntlShape, useIntl } from 'react-intl'
import { useMap } from 'react-map-gl'
// @ts-expect-error icons doesn't have typescript?
import { Micromobility } from '@opentripplanner/icons'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Suspense, useCallback } from 'react'

import * as mapActions from '../../../actions/map'
import { AppReduxState } from '../../../util/state-types'
import { IconWithText } from '../../util/styledIcon'
import { SetLocationHandler } from '../../util/types'

import { Card, CardBody, CardHeader, CardTitle } from './styled'

type VehicleFormFactor =
  | 'BICYCLE'
  | 'CARGO_BICYCLE'
  | 'MOPED'
  | 'SCOOTER'
  | 'SCOOTER_STANDING'
  | 'SCOOTER_SEATED'
  | 'OTHER'

export const getVehicleIcon = (
  vehicleType: VehicleFormFactor
): React.ReactNode => {
  switch (vehicleType) {
    case 'SCOOTER':
    case 'SCOOTER_SEATED':
    case 'SCOOTER_STANDING':
      return <Micromobility />
    default:
      return <Bicycle />
  }
}

const getVehicleText = (
  vehicleType: VehicleFormFactor,
  company: string,
  intl: IntlShape
) => {
  switch (vehicleType) {
    case 'BICYCLE':
    case 'CARGO_BICYCLE':
      return intl.formatMessage(
        {
          id: 'components.NearbyView.companyBicycle'
        },
        {
          company
        }
      )
    case 'SCOOTER':
    case 'SCOOTER_SEATED':
    case 'SCOOTER_STANDING':
    default:
      return intl.formatMessage(
        {
          id: 'components.NearbyView.companyScooter'
        },
        {
          company
        }
      )
  }
}

const StationIcon = ({
  companyLabel,
  vehicle
}: {
  companyLabel: string
  vehicle: any
}) => {
  const CompanyIcon = getCompanyIcon(vehicle.network)
  return CompanyIcon ? (
    <Suspense fallback={<span>{companyLabel}</span>}>
      <CompanyIcon height={22} style={{ marginRight: '5px' }} width={22} />
    </Suspense>
  ) : (
    <span>{getVehicleIcon(vehicle.vehicleType.formFactor)}</span>
  )
}

const Vehicle = ({
  companies,
  fromToSlot,
  vehicle,
  zoomToPlace
}: {
  companies?: Company[]
  fromToSlot: JSX.Element
  vehicle: any
  zoomToPlace: (map: any, stopData: any) => void
}): JSX.Element => {
  const map = useMap().default
  const intl = useIntl()
  const companyLabel =
    companies?.find((c) => c.id === vehicle.network)?.label ?? ''
  const { formFactor } = vehicle.vehicleType
  const name =
    vehicle.name === 'Default vehicle type'
      ? getVehicleText(formFactor, companyLabel, intl)
      : vehicle.name
  return (
    <Card
      onMouseEnter={useCallback(
        () => zoomToPlace(map, vehicle),
        [map, vehicle, zoomToPlace]
      )}
    >
      <CardHeader>
        <CardTitle>
          <IconWithText
            icon={<StationIcon companyLabel={companyLabel} vehicle={vehicle} />}
          >
            {name}
          </IconWithText>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {vehicle.name !== 'Default vehicle type' && vehicle.name !== name && (
          <div>{vehicle.name}</div>
        )}
        {fromToSlot}
      </CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  return {
    companies: config.companies
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Vehicle)
