import { formatDuration } from '@opentripplanner/core-utils/lib/time'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'

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
          <i className='fa fa-exclamation-circle' /> Service update
        </h3>
        <p>
          {useRealtime
            ? <span className='small'>
              Your trip results have been adjusted based on real-time
              information. Under normal conditions, this trip would take{' '}
              <b>{formatDuration(realtimeEffects.normalDuration)} </b>
              using the following routes:{' '}
              {filteredRoutes
                .map((route, idx) => (
                  <span key={idx}>
                    <b>{route}</b>
                    {filteredRoutes.length - 1 > idx && ', '}
                  </span>
                ))
              }.
            </span>
            : <span className='small'>
              Your trip results are currently being affected by service delays.
              These delays do not factor into travel times shown below.
            </span>
          }
        </p>
        <div>
          <Button
            block={componentClass === 'popover'} // display as block in popover
            className='toggle-realtime'
            onClick={toggleRealtime}
          >
            {useRealtime ? `Ignore` : `Apply`} service delays
          </Button>
        </div>
      </div>
    </div>

    if (componentClass === 'popover') {
      return <OverlayTrigger
        trigger='click'
        placement='bottom'
        // container={this}
        // containerPadding={40}
        overlay={
          <Popover style={{maxWidth: '300px'}} id='popover-positioned-bottom'>
            {innerContent}
          </Popover>
        }>
        <Button bsStyle='link'><i className='fa fa-2x fa-exclamation-circle' /></Button>
      </OverlayTrigger>
    } else {
      return innerContent
    }
  }
}
