import React, { Component, PropTypes } from 'react'

export default class LocationIcon extends Component {
  static propTypes = {
    type: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
  }

  render () {
    const { type, className, style } = this.props

    // from: #f5a81c
    // to: '#8ec449

    let classNameArr = ['fa', `${type}-location-icon`]
    if (type === 'from') classNameArr.push('fa-map-marker')
    else if (type === 'to') classNameArr.push('fa-dot-circle-o')
    if (className) classNameArr = classNameArr.concat(className.split(' '))

    return <i className={classNameArr.join(' ')} style={style} />
  }
}
