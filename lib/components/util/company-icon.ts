import { lazy } from 'react'

import { Props } from './company-icon-internal'
import withSuspense from './with-suspense'

/**
 * This component puts the "internal" CompanyIcon component, along with most of the OTP-UI icons package,
 * into a separate bundle (saves ~100 kB (~50 kB compressed) at the time of writing.
 */
export default withSuspense<Props>(
  lazy(() => import('./company-icon-internal'))
)
