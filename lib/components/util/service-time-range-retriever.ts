import { connect } from 'react-redux'
import { useEffect } from 'react'

import apiActionsV2 from '../../actions/apiV2'

interface Props {
  retrieveServiceTimeRangeIfNeeded: () => void
}

/**
 * Invisible component that retrieves the date range available
 * for OTP planning and schedule retrieval.
 */
const ServiceTimeRangeRetriever = ({
  retrieveServiceTimeRangeIfNeeded
}: Props): null => {
  // If not already done, retrieve the OTP available date range on mount.
  useEffect(() => {
    retrieveServiceTimeRangeIfNeeded()
  }, [retrieveServiceTimeRangeIfNeeded])

  // Component renders nothing
  return null
}

// Connect to redux
const mapDispatchToProps = {
  retrieveServiceTimeRangeIfNeeded:
    apiActionsV2.retrieveServiceTimeRangeIfNeeded
}

export default connect(null, mapDispatchToProps)(ServiceTimeRangeRetriever)
