import { lazy } from 'react'

import withSuspense from './with-suspense'

/**
 * This component puts the "internal" CompanyIcon component, along with most of the OTP-UI icons package,
 * into a separate bundle (saves ~100 kB (~50 kB compressed) at the time of writing.
 */
const CompanyIcon = lazy(() => import('./company-icon-internal'))

export default withSuspense(CompanyIcon)
