import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { FormattedList, FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import FormattedDuration from '../util/formatted-duration'
import Icon from '../util/icon'
import Strong from '../util/strong-text'

export default class RealtimeAnnotation extends Component {
  static propTypes = {
    componentClass: PropTypes.string,
    realtimeEffects: PropTypes.object
  }

  render() {
    const { componentClass, realtimeEffects } = this.props
    // Keep only the unique route IDs (so that duplicates are not listed).
    const filteredRoutes = realtimeEffects.normalRoutes.filter(
      (routeId, index, self) => self.indexOf(routeId) === index
    )
    // FIXME: there are some weird css things happening in desktop vs. mobile,
    // so I removed the divs with classNames and opted for h4 and p for now
    const innerContent = (
      <div className="realtime-alert">
        <div className="content">
          <h3>
            <Icon type="exclamation-circle" withSpace />
            <FormattedMessage id="components.RealtimeAnnotation.serviceUpdate" />
          </h3>
          <p className="small">
            <FormattedMessage
              id="components.RealtimeAnnotation.delaysShownInResults"
              values={{
                normalDuration: (
                  <FormattedDuration
                    duration={realtimeEffects.normalDuration}
                  />
                ),
                routes: (
                  <FormattedList
                    type="conjunction"
                    value={filteredRoutes.map((route) => (
                      <strong key={route.id}>{route}</strong>
                    ))}
                  />
                ),
                strong: Strong
              }}
            />
          </p>
        </div>
      </div>
    )

    if (componentClass === 'popover') {
      return (
        <OverlayTrigger
          overlay={
            <Popover
              id="popover-positioned-bottom"
              style={{ maxWidth: '300px' }}
            >
              {innerContent}
            </Popover>
          }
          placement="bottom"
          trigger="click"
        >
          <Button bsStyle="link">
            <i className="fa fa-2x fa-exclamation-circle" />
          </Button>
        </OverlayTrigger>
      )
    } else {
      return innerContent
    }
  }
}
