import React, {PropTypes, Component} from 'react'

import { getModeIcon } from '../../util/itinerary'

export default class ModeButton extends Component {
  static propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    mode: PropTypes.any, // currently a mode object or string
    icons: PropTypes.object,
    onClick: PropTypes.func
  }

  render () {
    const {active, icons, label, mode, onClick, showCheck, showPlusTransit} = this.props
    const height = this.props.height || 48
    const iconSize = height - 20

    const borderColor = active ? '#000' : '#ddd'
    return (
      <div className='mode-button-container' style={{ height: height + 24 }}>
        <button
          className='mode-button'
          onClick={onClick}
          title={label}
          style={{
            height,
            border: `1px solid ${borderColor}`,
            color: '#fff'
          }}
        >
          <div
            className='mode-icon'
            style={{ display: 'inline-block', fill: '#000', width: iconSize, height: iconSize, verticalAlign: 'middle' }}>
            {getModeIcon(mode, icons)}
          </div>
          {showPlusTransit && (
            <span>
              <i className='fa fa-plus' style={{ verticalAlign: 'middle', color: '#000', margin: '0px 5px', fontSize: 14 }} />
              <div style={{ display: 'inline-block', width: iconSize, height: iconSize, verticalAlign: 'middle' }}>
                {getModeIcon('TRANSIT', icons)}
              </div>
            </span>
          )}
        </button>
        <div className='mode-label' style={{ color: '#000', fontWeight: active ? 600 : 300 }}>{label}</div>
        {(showCheck && active) && <div>
          <div className='mode-check' style={{ color: 'white' }}><i className='fa fa-circle' /></div>
          <div className='mode-check' style={{ color: 'green' }}><i className='fa fa-check-circle' /></div>
        </div>}
      </div>
    )
  }
}
