import { IntlShape, useIntl } from 'react-intl'
import { Route } from '@opentripplanner/types'

import { ComponentContext } from './contexts'
import { RouteRowDetails } from '../components/viewers/route-row'
import React, { lazy, useContext } from 'react'
import styled from 'styled-components'

const StyledSelectContainer = styled.div`
  span {
    font-size: 14px !important;
    max-width: none;
  }

  .route-block {
    padding: 0;
  }
`

const routeOptions = (
  routes: Route[],
  intl: IntlShape,
  RouteRenderer?: any,
  ModeIcon?: any,
  simpleRouteRenderer?: boolean
) =>
  routes.map((r) => ({
    label: simpleRouteRenderer ? (
      r.shortName || r.longName
    ) : (
      <RouteRowDetails
        intl={intl}
        ModeIcon={ModeIcon}
        route={r}
        RouteRenderer={RouteRenderer}
        small
      />
    ),
    name: r.shortName || r.longName,
    value: r.id
  }))

interface RouteSelectProps {
  currentValue?: string | string[]
  disabled?: boolean
  id: string
  isMulti?: boolean
  onChange: (arg: string) => void
  placeholderText?: string
  routes: Route[]
  simpleRouteRenderer?: boolean
}

const RouteSelect = ({
  currentValue,
  disabled,
  id,
  isMulti,
  onChange,
  placeholderText,
  routes,
  simpleRouteRenderer
}: RouteSelectProps): JSX.Element => {
  // @ts-expect-error: No types for react-select.
  const Select = lazy(() => import('react-select'))

  // @ts-expect-error context is not typed
  const { ModeIcon, RouteRenderer } = useContext(ComponentContext)

  const intl = useIntl()

  const routesList = routeOptions(
    routes,
    intl,
    RouteRenderer,
    ModeIcon,
    simpleRouteRenderer
  )
  return (
    <StyledSelectContainer>
      <Select
        id={id}
        isMulti={isMulti}
        isOptionDisabled={disabled}
        onChange={
          (e: { label: JSX.Element; value: string }) => onChange(e.value)
          // eslint-disable-next-line react/jsx-curly-newline
        }
        options={routesList}
        placeholder={placeholderText}
        value={currentValue}
      />
    </StyledSelectContainer>
  )
}

export default RouteSelect
