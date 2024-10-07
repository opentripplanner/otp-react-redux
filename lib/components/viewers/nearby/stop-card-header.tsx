import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Search } from '@styled-icons/fa-solid/Search'
import { TransitOperator } from '@opentripplanner/types'
import React, { ComponentType } from 'react'

import { AppReduxState } from '../../../util/state-types'
import { Icon, IconWithText } from '../../util/styledIcon'
import { StopData } from '../../util/types'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import Link from '../../util/link'
import Strong from '../../util/strong-text'
import TransitOperatorLogos from '../../util/transit-operator-icons'

import { CardBody, CardHeader, CardTitle } from './styled'
import DistanceDisplay from './distance-display'

type Props = {
  actionIcon: ComponentType
  actionParams?: Record<string, unknown>
  actionPath: string
  actionText: JSX.Element
  fromToSlot: JSX.Element
  onZoomClick?: () => void
  stopData: StopData & { distance?: number }
  titleAs?: string
  transitOperators?: TransitOperator[]
}

const StopCardHeader = ({
  actionIcon,
  actionParams,
  actionPath,
  actionText,
  fromToSlot,
  onZoomClick,
  stopData,
  titleAs,
  transitOperators
}: Props): JSX.Element => {
  const intl = useIntl()

  const zoomButtonText = onZoomClick
    ? intl.formatMessage({
        id: 'components.StopViewer.zoomToStop'
      })
    : undefined

  return (
    <>
      <CardHeader>
        {/* @ts-expect-error The 'as' prop in styled-components is not listed for TypeScript. */}
        <CardTitle as={titleAs}>
          <TransitOperatorLogos
            stopData={stopData}
            transitOperators={transitOperators}
          />
          <span>{stopData.name}</span>
        </CardTitle>
        <DistanceDisplay distance={stopData.distance} />
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
            to={actionPath}
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
