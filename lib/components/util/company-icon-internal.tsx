// @ts-expect-error icons doesn't have typescript?
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import React, { ReactElement, Suspense, SVGAttributes } from 'react'

export interface Props extends SVGAttributes<unknown> {
  company?: string
  fallbackContent: ReactElement | null
}

const CompanyIcon = ({
  company,
  fallbackContent = null,
  ...otherProps
}: Props): ReactElement | null => {
  const CompanyIcon = getCompanyIcon && company ? getCompanyIcon(company) : null
  return CompanyIcon ? (
    <Suspense fallback={<span>{company}</span>}>
      <CompanyIcon {...otherProps} />
    </Suspense>
  ) : (
    fallbackContent
  )
}

export default CompanyIcon
