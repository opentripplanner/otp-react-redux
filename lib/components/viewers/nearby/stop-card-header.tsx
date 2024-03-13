import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { MapPin } from '@styled-icons/fa-solid'
import { Place, TransitOperator } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import React, { ComponentType } from 'react'

import { AppReduxState } from '../../../util/state-types'
import { Icon, IconWithText } from '../../util/styledIcon'
import { Pattern, StopTime } from '../../util/types'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import Link from '../../util/link'
import OperatorLogo from '../../util/operator-logo'
import Strong from '../../util/strong-text'

import { CardBody, CardHeader, CardTitle as NearbyCardTitle } from './styled'

type PatternStopTime = {
  pattern: Pattern
  stoptimes: StopTime[]
}

type StopData = Place & {
  code: string
  gtfsId: string
  stoptimesForPatterns: PatternStopTime[]
}

type Props = {
  CardTitle: string
  actionIcon: ComponentType
  actionParams?: Record<string, unknown>
  actionText: JSX.Element
  actionUrl: string
  fromToSlot: JSX.Element
  onZoomClick: () => void
  stopData: StopData
  transitOperators?: TransitOperator[]
}

const Operator = ({ operator }: { operator?: TransitOperator }) => {
  const intl = useIntl()
  return operator && operator.logo ? (
    /* Span with agency classname allows optional contrast/customization in user 
    config for logos with poor contrast. Class name is hyphenated agency name 
    e.g. "sound-transit" */
    <span
      className={
        operator.name ? operator.name.replace(/\s+/g, '-').toLowerCase() : ''
      }
    >
      <OperatorLogo
        alt={intl.formatMessage(
          {
            id: 'components.StopViewer.operatorLogoAriaLabel'
          },
          {
            operatorName: operator.name
          }
        )}
        operator={operator}
      />
    </span>
  ) : (
    <MapPin />
  )
}

const StopCardHeader = ({
  actionIcon,
  actionParams,
  actionText,
  actionUrl,
  CardTitle,
  fromToSlot,
  onZoomClick,
  stopData,
  transitOperators
}: Props): JSX.Element => {
  const intl = useIntl()
  const agencies = stopData.stoptimesForPatterns?.reduce<Set<string>>(
    // @ts-expect-error The agency type is not yet compatible with OTP2
    (prev, cur) => prev.add(cur.pattern.route.agency.gtfsId),
    new Set()
  )
  const zoomButtonText = onZoomClick
    ? intl.formatMessage({
        id: 'components.StopViewer.zoomToStop'
      })
    : null

  return (
    <>
      <CardHeader>
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
        <NearbyCardTitle as={CardTitle}>{stopData.name}</NearbyCardTitle>
      </CardHeader>
      <CardBody>
        <div>
          <FormattedMessage
            id="components.StopViewer.displayStopId"
            values={{
              stopId: stopData.code || stopData.gtfsId,
              strong: Strong
            }}
          />
          {onZoomClick ? (
            <button
              className="link-button"
              onClick={onZoomClick}
              title={zoomButtonText}
            >
              <Icon Icon={Search} style={{ marginLeft: '0.2em' }} />
              <InvisibleA11yLabel>{zoomButtonText}</InvisibleA11yLabel>
            </button>
          ) : null}
          <Link
            className="pull-right"
            style={{ color: 'inherit', fontSize: 'small' }}
            to={actionUrl}
            toParams={actionParams}
          >
            <IconWithText Icon={actionIcon}>{actionText}</IconWithText>
          </Link>
        </div>
        {fromToSlot}
      </CardBody>
    </>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  return {
    transitOperators: config.transitOperators
  }
}

export default connect(mapStateToProps)(StopCardHeader)
