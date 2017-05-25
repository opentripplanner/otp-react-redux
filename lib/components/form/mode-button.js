import React, {PropTypes, Component} from 'react'

import { getModeIcon } from '../../util/itinerary'

export default class ModeButton extends Component {
  static propTypes = {
    active: PropTypes.bool,
    mode: PropTypes.string,
    queryModes: PropTypes.array,
    setMode: PropTypes.func
  }

  _onToggleMode = () => {
    const {active, mode, queryModes, setMode} = this.props
    // remove icon
    if (active) {
      setMode({mode: queryModes.filter(m => m !== mode).join(',')})
    } else {
      // add icon
      queryModes.push(mode)
      setMode({mode: queryModes.join(',')})
    }
  }

  render () {
    const {active, icons, mode} = this.props
    return (
      <div className='mode-icon-highlight'>
        <button
          onClick={this._onToggleMode}
          title={mode}>
          <div
            className='mode-icon'
            style={{ fill: active ? 'red' : '#bbb' }}>
            {getModeIcon(mode, icons)}
          </div>
        </button>
      </div>
    )
  }
}
