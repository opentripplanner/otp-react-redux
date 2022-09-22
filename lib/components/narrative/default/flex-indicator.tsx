import { barberPole } from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'
import { CompressArrowsAlt } from '@styled-icons/fa-solid/CompressArrowsAlt'
import { FormattedMessage } from 'react-intl'
import { HandPaper } from '@styled-icons/fa-regular/HandPaper'
import { Phone } from '@styled-icons/fa-solid/Phone'
import React from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import { StyledIconWrapper } from '../../util/styledIcon'

export const FLEX_COLOR = '#FA6400'
const FLEX_COLOR_LIGHT = tinycolor(FLEX_COLOR).lighten(40).toHexString()

type FlexIndicatorProps = {
  isCallAhead: boolean
  isContinuousDropoff: boolean
  phoneNumber: string
  shrink: boolean
  textOnly?: boolean
}

type FlexNoticeProps = {
  Icon?: React.ElementType
  showText: boolean
  text: string | React.ReactElement
}

const FlexNotice = ({ Icon, showText, text }: FlexNoticeProps) => (
  <>
    <StyledIconWrapper>{Icon && <Icon />}</StyledIconWrapper>
    {showText && <p>{text}</p>}
  </>
)

const FlexIndicatorWrapper = styled.div<{ shrink: boolean }>`
  align-items: center;
  background: ${FLEX_COLOR_LIGHT};
  border-bottom-right-radius: 8px;
  border-top-right-radius: 8px;
  color: ${FLEX_COLOR};
  display: grid;
  grid-template-columns: 1fr 2fr 3fr 2fr;
  grid-template-rows: 1fr 2fr;
  grid-column-gap: ${(props) => (props.shrink ? '8px' : 'inherit')};
  height: ${(props) => (props.shrink ? '40px' : '70px')};
  margin-right: 1em;
  max-width: ${(props) => (props.shrink ? '60px' : '180px')};
  padding-right: 0.25em;

  /* "Flex Service" text */
  h4 {
    grid-column: 2 / span 3;
    grid-row: 1;
    margin: 0;
    margin-left: 1ch;
    padding-top: 0.25em;
    text-align: left;
  }

  /* Icon (phone or hand) */
  span {
    font-size: 32px;
    grid-column: 2;
    grid-row: 2;
    height: 100%;
    width: 100%;
  }

  /* Description text */
  p {
    font-size: 13px;
    grid-column: 3 / span 2;
    grid-row: 2;
    text-overflow: ellipsis;
    overflow-y: clip;
  }

  /* Barber pole at left */
  &::before {
    background: ${barberPole(FLEX_COLOR)};
    content: '';
    display: block;
    grid-row: 1 / span 2;
    height: inherit;
    position: relative;
    width: 20px;
  }
`

export const FlexIndicator = ({
  isCallAhead,
  isContinuousDropoff,
  phoneNumber,
  shrink,
  textOnly
}: FlexIndicatorProps): React.ReactElement => {
  let text = <></>
  let Icon
  if (isCallAhead && isContinuousDropoff) {
    text = <FormattedMessage id="config.flex.both" values={{ phoneNumber }} />
    Icon = CompressArrowsAlt
  }
  if (isCallAhead && !isContinuousDropoff) {
    text = (
      <FormattedMessage id="config.flex.call-ahead" values={{ phoneNumber }} />
    )
    Icon = Phone
  }
  // Only show continuous dropoff message if call ahead message isn't shown
  if (isContinuousDropoff && !isCallAhead) {
    text = <FormattedMessage id="config.flex.continuous-dropoff" />
    Icon = HandPaper
  }

  if (textOnly)
    return (
      <>
        <FormattedMessage id="config.flex.flex-service-colon" /> {text}
      </>
    )

  return (
    <FlexIndicatorWrapper shrink={shrink}>
      {!shrink && (
        <h4>
          <FormattedMessage id="config.flex.flex-service" />
        </h4>
      )}
      <FlexNotice Icon={Icon} showText={!shrink} text={text} />
    </FlexIndicatorWrapper>
  )
}
