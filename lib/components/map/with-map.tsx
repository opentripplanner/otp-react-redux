import { MapRef, useMap } from 'react-map-gl'
import React, { ClassicComponentClass, FC } from 'react'

/**
 * Higher-order component that passes a map prop to its children.
 * Intended to wrap around class components that are direct or indirect children of <MapProvider>.
 * Function components should use react-map-gl's useMap instead.
 */
export default function withMap<T>(
  ClassComponent: ClassicComponentClass<T>
): FC<T & { map: MapRef }> {
  const WrappedComponent = (props: T): JSX.Element => {
    const { default: map } = useMap()
    return <ClassComponent {...props} map={map} />
  }

  return WrappedComponent
}
