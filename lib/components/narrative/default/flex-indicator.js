// Craco will require this. FIXME: remove line once migrated to craco
// eslint-disable-next-line no-unused-vars
import React from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import { barberPole } from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'

import Icon from '../../util/icon'

export const FLEX_COLOR = '#FA6400'
const FLEX_COLOR_LIGHT = tinycolor(FLEX_COLOR).lighten(40).toHexString()

export const FlexIndicator = ({isCallAhead, isOptional}) =>
  <FlexIndicatorWrapper>
    <h4>Flex Service</h4>
    {isCallAhead && <FlexNotice faKey='phone' text='Call to reserve: (555) 555-5555' />}
    {isOptional && !isCallAhead && <FlexNotice faKey='hand-paper-o' text='Communicate with operator about stop' />}
  </FlexIndicatorWrapper>

const FlexNotice = ({ faKey, text }) => (
  <>
    <Icon name={faKey} />
    <p>{text}</p>
  </>
)

const FlexIndicatorWrapper = styled.div`
    background: ${FLEX_COLOR_LIGHT};
    border-bottom-right-radius: 8px;
    border-top-right-radius: 8px;
    color: ${FLEX_COLOR};
    display: grid;
    grid-template-columns: 1fr 2fr 3fr 2fr;
    grid-template-rows: 1fr 2fr;
    height: 80px;
    margin-right: 1em;
    max-width: 190px;
    padding-right: 0.25em;

    h4 {
        grid-column: 3 / span 2;
        grid-row: 1;
        margin: 0;
        padding-top: 2px;
        text-align: left;
    }

    span {
        font-size: 32px;
        grid-column: 2;
        grid-row: 2;
        height: 100%;
        width: 100%;
    }

    p {
        font-size: 13px;
        grid-column: 3 / span 2;
        grid-row: 2;
    }

    &::before {
        background: ${barberPole(FLEX_COLOR)};
        content: '';
        display: block;
        height: inherit;
        position: absolute;
        width: 20px;
    }
`
