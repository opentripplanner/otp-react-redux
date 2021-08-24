import styled from 'styled-components'

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
  background: #ddd;
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

export const ItineraryContainer = styled.div`
  border: 3px solid #444;
  margin-top: .5em;

  & > h3 {
    background: #444;
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
  background: #eee;
  border: 1px solid #bbb;
  border-radius: 0;
  margin-top: 15px;
  padding: 5px;
`
