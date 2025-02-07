import React, { ComponentType, Suspense } from 'react'

/**
 * Wraps a component with suspense, assuming the wrapped component is lazily loaded.
 */
export default function withSuspense<T>(
  WrappedComponent: ComponentType<T>
): ComponentType<T> {
  const suspensedComponent = (props: T): JSX.Element => (
    <Suspense fallback={<span />}>
      <WrappedComponent {...props} />
    </Suspense>
  )

  return suspensedComponent
}
