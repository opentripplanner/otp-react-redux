import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { AppReduxState } from '../../util/state-types'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { summarizeQuery } from '../form/user-settings-i18n'
import { User } from '../user/types'
import DefaultMap from '../map/default-map'

import TripPreviewLayoutBase from './trip-preview-layout-base'

type Props = {
  // TODO: Typescript activeSearch type
  activeSearch: any
  intl: IntlShape
  itinerary: Itinerary
  location?: { search?: string }
  parseUrlQueryString: (params?: any, source?: string) => any
  user: User
}

class PrintLayout extends Component<Props> {
  _close = () => {
    window.location.replace(String(window.location).replace('print/', ''))
  }

  componentDidMount() {
    const { itinerary, location, parseUrlQueryString } = this.props

    // Parse the URL query parameters, if present
    if (!itinerary && location && location.search) {
      parseUrlQueryString()
    }
  }

  render() {
    const { activeSearch, intl, itinerary, user } = this.props
    const printVerb = intl.formatMessage({ id: 'common.forms.print' })

    return (
      <TripPreviewLayoutBase
        header={<FormattedMessage id="components.PrintLayout.itinerary" />}
        itinerary={itinerary}
        mapElement={
          <div className="map-container">
            {/* FIXME: Improve reframing/setting map bounds when itinerary is received. */}
            <DefaultMap />
          </div>
        }
        onClose={this._close}
        subTitle={
          activeSearch &&
          summarizeQuery(activeSearch.query, intl, user.savedLocations)
        }
        title={printVerb}
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const activeSearch = getActiveSearch(state)
  const { localUser, loggedInUser } = state.user
  const user = loggedInUser || localUser
  return {
    activeSearch,
    itinerary: getActiveItinerary(state) as Itinerary,
    user
  }
}

const mapDispatchToProps = {
  parseUrlQueryString: formActions.parseUrlQueryString,
  routingQuery: apiActions.routingQuery
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PrintLayout))
