import React, { Component } from 'react'

export default class SimpleRealtimeAnnotation extends Component {
  render () {
    return <div style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
      <i className='fa fa-clock-o' /> This trip uses real-time traffic and delay information
    </div>
  }
}
