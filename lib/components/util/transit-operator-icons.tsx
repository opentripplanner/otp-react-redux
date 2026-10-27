import { MapPin } from '@styled-icons/fa-solid/MapPin'
import { useIntl } from 'react-intl'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'
import type { TransitOperator } from '@opentripplanner/types'

import InvisibleA11yLabel from './invisible-a11y-label'
import OperatorLogo from './operator-logo'

const OperatorContainer = styled.span`
  margin-right: 0.5ch;
`

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
        operatorName: operator ? operator.name : ''
      }
    )
    return operator.logo ? (
      // Span with agency classname allows optional contrast/customization in user
      // config for logos with poor contrast. Class name is hyphenated agency name
      // e.g. "sound-transit"
      <OperatorContainer
        className={
          operator.name ? operator.name.replace(/\s+/g, '-').toLowerCase() : ''
        }
      >
        <OperatorLogo alt={operatorLogoAriaLabel} operator={operator} styled />
      </OperatorContainer>
    ) : (
      // If operator exists but logo is missing,
      // we still need to announce the operator name to screen readers.
      <>
        <MapPin style={{ maxHeight: 24, padding: '0 0.25ch' }} />
        <InvisibleA11yLabel>{operatorLogoAriaLabel}</InvisibleA11yLabel>
      </>
    )
  }
}

const TransitOperatorLogos = ({
  agencies,
  loading = false,
  transitOperators
}: {
  agencies: Set<string>
  loading?: boolean
  transitOperators?: TransitOperator[]
}): JSX.Element => {
  return (
    <>
      {loading ? (
        <OperatorContainer>
          <Skeleton height="1em" width="1em" />
        </OperatorContainer>
      ) : (
        transitOperators
          ?.filter((to) => Array.from(agencies).includes(to.agencyId))
          // Second pass to remove duplicates based on name
          .filter(
            (to, index, arr) =>
              index === arr.findIndex((t) => t?.name === to?.name)
          )
          .map((to) => <Operator key={to.agencyId} operator={to} />)
      )}
    </>
  )
}

export default TransitOperatorLogos
