// @ts-expect-error icons doesn't have typescript?
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import React, { Suspense } from 'react'

type Props = {
  company: string
  fallbackIcon?: ReactNode
}

const CompanyIcon = ({ company, fallbackIcon = null }: Props): ReactNode => {
  const CompanyIcon = getCompanyIcon ? getCompanyIcon(company) : null
  return CompanyIcon ? (
    <Suspense fallback={<span>{company}</span>}>
      <CompanyIcon height={22} style={{ marginRight: '5px' }} width={22} />
    </Suspense>
  ) : (
    fallbackIcon
  )
}

export default CompanyIcon
