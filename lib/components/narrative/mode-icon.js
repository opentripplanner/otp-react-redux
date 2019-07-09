import Icon from './icon'
import React, {PropTypes, Component} from 'react'

export default class ModeIcon extends Component {
  static propTypes = {
    mode: PropTypes.string
  }
  render () {
    const { mode, defaultToText } = this.props
    switch (mode) {
      case 'BICYCLE':
        return <span className='mode-icon'><Icon title={'bicycle'} type='bicycle' /></span>
      case 'BUS':
        return <span className='mode-icon'><Icon title={'bus'} type='bus' /></span>
      case 'CAR':
        return <span className='mode-icon'><Icon title={'car'} type='car' /></span>
      case 'TRAM':
        return <span className='mode-icon'><Icon title={'tram'} type='train' /></span>
      case 'SUBWAY':
        return <span className='mode-icon'><Icon title={'subway'} type='subway' /></span>
      case 'WALK':
        return <span className='mode-icon'><Icon title={'walk'} type='male' /></span>
      case 'MICROMOBILITY':
        return <span className='mode-icon'><Icon title={'micromobility'} type='flash' /></span>
      default:
        return defaultToText ? <span>{mode}</span> : null
    }
  }
}
