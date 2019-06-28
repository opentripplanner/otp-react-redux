import React, {PropTypes, Component, PureComponent} from 'react'

import { getIcon, isTransit } from '../../util/itinerary'

export default class ModeButton extends Component {
  static propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    mode: PropTypes.any, // currently a mode object or string
    icons: PropTypes.object,
    onClick: PropTypes.func
  }

  _getButtonStyle ({
    active,
    enabled,
    height,
    modeStr
  }) {
    const buttonStyle = { height }

    if (modeStr !== 'TRANSIT' && isTransit(modeStr)) {
      buttonStyle.width = height
      buttonStyle.border = `2px solid ${enabled ? (active ? '#000' : '#bbb') : '#ddd'}`
      if (active && enabled) buttonStyle.backgroundColor = '#fff'
      buttonStyle.borderRadius = height / 2
    } else {
      buttonStyle.border = active ? '2px solid #000' : '1px solid #bbb'
      if (active) buttonStyle.backgroundColor = '#add8e6'
    }

    return buttonStyle
  }

  render () {
    const {
      active,
      enabled,
      icons,
      label,
      mode,
      onClick,
      inlineLabel,
      showPlusTransit
    } = this.props
    const height = this.props.height || 48
    const iconSize = height - 20
    const iconColor = enabled ? '#000' : '#ccc'
    const modeStr = mode.company || mode.mode || mode
    const buttonStyle = this._getButtonStyle({ active, enabled, height, modeStr })

    return (
      <div
        className={`mode-button-container ${enabled ? 'enabled' : 'disabled'}`}
        style={{ height: height + (inlineLabel ? 8 : 24), textAlign: 'center' }}
      >
        <button
          className='mode-button'
          onClick={onClick}
          title={label}
          style={buttonStyle}
          disabled={!enabled}
        >
          {showPlusTransit && (
            <PlusTransit
              enabled={enabled}
              iconColor={iconColor}
              icons={icons}
              iconSize={iconSize}
            />
          )}

          {/* Show the primary mode icon */}
          <div
            className='mode-icon'
            style={{
              display: 'inline-block',
              fill: iconColor,
              width: iconSize,
              height: iconSize,
              verticalAlign: 'middle'
            }}
          >
            {getIcon(modeStr, icons)}
          </div>

          {/* Show the inline label, if enabled */}
          {inlineLabel && (
            <span style={{
              fontSize: iconSize * 0.8,
              marginLeft: 10,
              verticalAlign: 'middle',
              fontWeight: active ? 600 : 300
            }}
            >
              {label}
            </span>
          )}
        </button>

        {/* If not in inline-label mode, label directly below the button */}
        {!inlineLabel && (
          <div
            className='mode-label'
            style={{ color: iconColor, fontWeight: active ? 600 : 300 }}
          >
            {label}
          </div>
        )}
      </div>
    )
  }
}

class PlusTransit extends PureComponent {
  render () {
    const {enabled, iconColor, icons, iconSize} = this.props
    return (
      <span>
        <div
          style={{
            display: 'inline-block',
            width: iconSize,
            height: iconSize,
            verticalAlign: 'middle'
          }}
        >
          {enabled
            ? getIcon('TRANSIT', icons)
            : (
              <div style={{
                width: iconSize,
                height: iconSize,
                backgroundColor: iconColor,
                borderRadius: iconSize / 2
              }} />
            )
          }
        </div>
        <i
          className='fa fa-plus'
          style={{
            verticalAlign: 'middle',
            color: iconColor,
            margin: '0px 5px',
            fontSize: 14
          }}
        />
      </span>
    )
  }
}
