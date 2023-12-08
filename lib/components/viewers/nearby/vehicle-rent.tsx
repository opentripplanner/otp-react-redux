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
import React, { Suspense } from 'react'

import * as mapActions from '../../../actions/map'
import { IconWithText } from '../../util/styledIcon'

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
    case 'BICYCLE':
    case 'CARGO_BICYCLE':
      return <Bicycle />
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

const Vehicle = ({
  companies,
  setLocation,
  vehicle,
  zoomToPlace
}: {
  companies: Company[]
  setLocation: (args: any) => void
  vehicle: any
  zoomToPlace: (map: any, stopData: any) => void
}): JSX.Element => {
  const map = useMap().default
  const intl = useIntl()
  const company = companies.find((c) => c.id === vehicle.network)?.label ?? ''
  const { formFactor } = vehicle.vehicleType
  const name =
    vehicle.name === 'Default vehicle type'
      ? getVehicleText(formFactor, company, intl)
      : vehicle.name
  const setLocationFromPlace = (locationType: 'from' | 'to') => {
    const location = {
      lat: vehicle.lat,
      lon: vehicle.lon,
      name
    }
    setLocation({ location, locationType, reverseGeocode: false })
  }
  const StationIcon = () => {
    const CompanyIcon = getCompanyIcon(vehicle.network)
    return CompanyIcon ? (
      <Suspense fallback={<span>{company}</span>}>
        <CompanyIcon height={22} style={{ marginRight: '5px' }} width={22} />
      </Suspense>
    ) : (
      <span>{getVehicleIcon(formFactor)}</span>
    )
  }
  return (
    <Card onMouseEnter={() => zoomToPlace(map, vehicle)}>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={StationIcon}>{name}</IconWithText>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {vehicle.name !== 'Default vehicle type' && vehicle.name !== name && (
          <div>{vehicle.name}</div>
        )}
        <span role="group">
          <FromToLocationPicker
            label
            onFromClick={() => setLocationFromPlace('from')}
            onToClick={() => setLocationFromPlace('to')}
          />
        </span>
      </CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  const { config } = state.otp
  return {
    companies: config.companies
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Vehicle)
