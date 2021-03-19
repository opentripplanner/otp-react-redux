import React, { Component } from 'react'

export default class SimpleRealtimeAnnotation extends Component {
  render () {
    return <div className='simple-realtime-annotation'>
      <i className='fa fa-clock-o' /> This trip uses real-time traffic and delay information
    </div>
  }
}
