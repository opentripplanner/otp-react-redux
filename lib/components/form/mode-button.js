import React, {PropTypes, Component} from 'react'

import { getModeIcon, isTransit } from '../../util/itinerary'

export default class ModeButton extends Component {
  static propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    mode: PropTypes.any, // currently a mode object or string
    icons: PropTypes.object,
    onClick: PropTypes.func
  }

  render () {
    const {active, enabled, icons, label, mode, onClick, showCheck, showPlusTransit} = this.props
    const height = this.props.height || 48
    const iconSize = height - 20

    const borderColor = enabled ? (active ? '#000' : '#bbb') : '#ddd'
    const iconColor = enabled ? '#000' : '#ccc'
    const modeStr = mode.mode || mode
    const buttonStyle = {
      height,
      border: `1px solid ${borderColor}`,
      color: '#fff'
    }

    if (isTransit(modeStr)) {
      buttonStyle.width = height
      buttonStyle.border = `2px solid ${borderColor}`
      if (active && enabled) buttonStyle.backgroundColor = '#fff'
      buttonStyle.borderRadius = height / 2
    }

    return (
      <div className={`mode-button-container ${enabled ? 'enabled' : 'disabled'}`} style={{ height: height + 24, textAlign: 'center' }}>
        <button
          className='mode-button'
          onClick={onClick}
          title={label}
          style={buttonStyle}
          disabled={!enabled}
        >
          <div
            className='mode-icon'
            style={{ display: 'inline-block', fill: iconColor, width: iconSize, height: iconSize, verticalAlign: 'middle' }}>
            {getModeIcon(mode, icons)}
          </div>
          {showPlusTransit && (
            <span>
              <i className='fa fa-plus' style={{ verticalAlign: 'middle', color: iconColor, margin: '0px 5px', fontSize: 14 }} />
              <div style={{ display: 'inline-block', width: iconSize, height: iconSize, verticalAlign: 'middle' }}>
                {enabled
                  ? getModeIcon('TRANSIT', icons)
                  : <div style={{ width: iconSize, height: iconSize, backgroundColor: iconColor, borderRadius: iconSize/2 }} />
                }
              </div>
            </span>
          )}
        </button>
        <div className='mode-label' style={{ color: iconColor, fontWeight: active ? 600 : 300 }}>{label}</div>
        {/*(showCheck && active) && <div>
          <div className='mode-check' style={{ color: 'white' }}><i className='fa fa-circle' /></div>
          <div className='mode-check' style={{ color: 'green' }}><i className='fa fa-check-circle' /></div>
        </div>*/}
      </div>
    )
  }
}
