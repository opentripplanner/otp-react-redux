import styled from 'styled-components'

import { grey } from '../util/colors'
import TripDetails from '../narrative/connected-trip-details'

// This file contains styles specific for rendering PrintFieldTripLayout.
// They generally mimic the styles found in the OTP native client.

export const PrintLayout = styled.div`
  font-size: 16px;
  line-height: 115%;
  margin: 8px;
`

export const Header = styled.div``

export const TripTitle = styled.h1`
  border-bottom: 3px solid gray;
  font-size: 30px;
  font-weight: bold;
`

export const TripInfoList = styled.ul`
  font-size: 16px;
  list-style: none;
  margin-top: 1em;
  padding: 0;
`

export const Val = styled.span`
  :empty:before {
    content: 'N/A';
  }
`

// The styles below mirror those found in OTP native client.
export const TripContainer = styled.div`
  background: ${grey[100]};
  margin-top: 1em;

  & > h2 {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    padding: 4px;
  }
`

export const TripBody = styled.div`
  padding: 8px;
`
const DARK_GREY_BACKGROUND_BORDER = grey[800]

export const ItineraryContainer = styled.div`
  border: 3px solid ${DARK_GREY_BACKGROUND_BORDER};
  margin-top: 0.5em;

  & > h3 {
    background: ${DARK_GREY_BACKGROUND_BORDER};
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    padding: 4px;
  }
`

export const PrintableItineraryContainer = styled.div`
  background: white;
  padding: 12px;
`

export const TripSummary = styled(TripDetails)`
  background: ${grey[50]};
  border: 1px solid ${grey[200]};
  border-radius: 0;
  margin-top: 15px;
  padding: 5px;
`
