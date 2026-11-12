import { IntlShape, useIntl } from 'react-intl'
import { Route } from '@opentripplanner/types'
import React, { lazy, useContext, useMemo } from 'react'
import styled from 'styled-components'

import { RouteRowDetails } from '../components/viewers/route-row'

import { ComponentContext } from './contexts'

const StyledSelectContainer = styled.div`
  span {
    font-size: 14px !important;
    max-width: none;
  }

  .route-block {
    padding: 0;
  }
`

export type RouteSelectOption = {
  label: string | JSX.Element | undefined
  name: string | undefined
  value: string
}

const routeOptions = (
  routes: Route[],
  intl: IntlShape,
  RouteRenderer?: any,
  ModeIcon?: any,
  simpleRouteRenderer?: boolean
): RouteSelectOption[] =>
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
  disabled?: (arg: RouteSelectOption) => boolean
  id: string
  isMulti?: boolean
  onChange: (arg: any) => void
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

  const routesList = useMemo(
    () =>
      routeOptions(routes, intl, RouteRenderer, ModeIcon, simpleRouteRenderer),
    []
  )
  const findOption = (id: string) => routesList.find((r) => r.value === id)

  // current value is either a string or an array (depending on if the component is multiselect)
  const findValue = (value: string | string[] | undefined) => {
    if (value === undefined) return
    if (typeof value === 'string') return findOption(value)
    if (typeof value !== 'string' && isMulti)
      // @ts-expect-error There's no way value can be a string below but ts is still throwing an error
      return value.map((v: string[]) => findOption(v))
  }

  return (
    <StyledSelectContainer>
      <Select
        id={id}
        isMulti={isMulti}
        isOptionDisabled={disabled}
        onChange={onChange}
        options={routesList}
        placeholder={
          placeholderText ||
          intl.formatMessage({ id: 'components.RouteViewer.findARoute' })
        }
        value={findValue(currentValue)}
      />
    </StyledSelectContainer>
  )
}

export default RouteSelect
