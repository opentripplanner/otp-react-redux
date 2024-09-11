import { MapPin } from '@styled-icons/fa-solid'
import { useIntl } from 'react-intl'
import React from 'react'
import type { TransitOperator } from '@opentripplanner/types'

import InvisibleA11yLabel from './invisible-a11y-label'
import OperatorLogo from './operator-logo'
import type { StopData } from './types'

const Operator = ({ operator }: { operator?: TransitOperator }) => {
  const intl = useIntl()

  if (!operator) {
    return null
  } else {
    const operatorLogoAriaLabel = intl.formatMessage(
      {
        id: 'components.StopViewer.operatorLogoAriaLabel'
      },
      {
        operatorName: operator.name
      }
    )
    return operator.logo ? (
      // Span with agency classname allows optional contrast/customization in user
      // config for logos with poor contrast. Class name is hyphenated agency name
      // e.g. "sound-transit"
      <span
        className={
          operator.name ? operator.name.replace(/\s+/g, '-').toLowerCase() : ''
        }
      >
        <OperatorLogo alt={operatorLogoAriaLabel} operator={operator} />
      </span>
    ) : (
      // If operator exists but logo is missing,
      // we still need to announce the operator name to screen readers.
      <>
        <MapPin />
        <InvisibleA11yLabel>{operatorLogoAriaLabel}</InvisibleA11yLabel>
      </>
    )
  }
}

const TransitOperatorLogos = ({
  stopData,
  transitOperators
}: {
  stopData: StopData | undefined
  transitOperators?: TransitOperator[]
}): JSX.Element => {
  const agencies =
    (stopData &&
      stopData.stoptimesForPatterns?.reduce<Set<string>>((prev, cur) => {
        // @ts-expect-error The agency type is not yet compatible with OTP2
        const agencyGtfsId = cur.pattern.route.agency?.gtfsId
        return agencyGtfsId ? prev.add(agencyGtfsId) : prev
      }, new Set())) ||
    new Set()

  return (
    <>
      {transitOperators
        ?.filter((to) => Array.from(agencies).includes(to.agencyId))
        // Second pass to remove duplicates based on name
        .filter(
          (to, index, arr) =>
            index === arr.findIndex((t) => t?.name === to?.name)
        )
        .map((to) => (
          <Operator key={to.agencyId} operator={to} />
        ))}
    </>
  )
}

export default TransitOperatorLogos
