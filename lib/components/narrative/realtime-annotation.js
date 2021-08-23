import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { FormattedList, FormattedMessage } from 'react-intl'

import { FormattedDuration } from '../util/format-duration'
import IconWithSpace from '../util/icon-with-space'

export default class RealtimeAnnotation extends Component {
  static propTypes = {
    realtimeEffects: PropTypes.object,
    toggleRealtime: PropTypes.func,
    useRealtime: PropTypes.bool
  }

  render () {
    const {
      componentClass,
      realtimeEffects,
      toggleRealtime,
      useRealtime
    } = this.props
    // Keep only the unique route IDs (so that duplicates are not listed).
    const filteredRoutes = realtimeEffects.normalRoutes
      .filter((routeId, index, self) => self.indexOf(routeId) === index)
    // FIXME: there are some weird css things happening in desktop vs. mobile,
    // so I removed the divs with classNames and opted for h4 and p for now
    const innerContent = <div className='realtime-alert'>
      <div className='content'>
        <h3>
          <IconWithSpace type='exclamation-circle' />
          <FormattedMessage id='components.RealtimeAnnotation.serviceUpdate' />
        </h3>
        <p className='small'>
          {useRealtime
            ? (
              <FormattedMessage
                id='components.RealtimeAnnotation.delaysShownInResults'
                values={{
                  b: chunks => <b>{chunks}</b>,
                  normalDuration: (
                    <FormattedDuration
                      duration={realtimeEffects.normalDuration}
                    />
                  ),
                  routes: (
                    <FormattedList
                      type='conjunction'
                      value={filteredRoutes.map(route => <b>{route}</b>)}
                    />
                  )
                }}
              />
            )
            : <FormattedMessage id='components.RealtimeAnnotation.delaysNotShownInResults' />
          }
        </p>
        <div>
          <Button
            block={componentClass === 'popover'} // display as block in popover
            className='toggle-realtime'
            onClick={toggleRealtime}
          >
            {useRealtime
              ? <FormattedMessage id='components.RealtimeAnnotation.ignoreServiceDelays' />
              : <FormattedMessage id='components.RealtimeAnnotation.applyServiceDelays' />
            }
          </Button>
        </div>
      </div>
    </div>

    if (componentClass === 'popover') {
      return <OverlayTrigger
        overlay={
          <Popover id='popover-positioned-bottom' style={{maxWidth: '300px'}}>
            {innerContent}
          </Popover>
        }
        placement='bottom'
        trigger='click'>
        <Button bsStyle='link'><i className='fa fa-2x fa-exclamation-circle' /></Button>
      </OverlayTrigger>
    } else {
      return innerContent
    }
  }
}
