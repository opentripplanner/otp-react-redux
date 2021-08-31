import React, { Component } from 'react'
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group'
import PropTypes from 'prop-types'

import Icon from '../narrative/icon'

export class MenuItem extends Component {
  state = {
    expanded: false,
    toggleChevron: false
  }

  static propTypes = {
    containsSubmenu: PropTypes.bool,
    iconurl: PropTypes.string,
    isSubmenuItem: PropTypes.bool,
    label: PropTypes.string,
    name: PropTypes.string,
    onClick: PropTypes.func,
    url: PropTypes.string
  }

  _toggleChevron = () => {
    const toggleChevron = this.state.toggleChevron
    this.setState({ toggleChevron: !toggleChevron })
  }

  render () {
    const {
      containsSubmenu,
      iconType,
      iconurl,
      isSubmenuItem,
      label,
      onClick,
      url
    } = this.props

    return (
      <div className='menu-container'>
        <div className='menu-item'>
          <Icon iconurl={iconurl} name={iconType} />
          <span className={'menu-item-title'}>
            {iconurl ? <img alt={`Icon for ${label}`} src={iconurl} /> : ''}
            <button
              className={`menu-item-button ${isSubmenuItem ? 'sub-menu-item-button' : ''}`}
              onClick={onClick}>
              {url
                ? <a href={url}>{label}</a>
                : label}
            </button>
          </span>
          <div className='expansion-button-container'>
            {containsSubmenu && (
              <button className='menu-expansion-button' onClick={this._toggleChevron}>
                <Icon name={`chevron-${this.state.toggleChevron ? 'up' : 'down'}`} />
              </button>
            )}
          </div>
          <VelocityTransitionGroup
            enter={{ animation: 'slideDown' }}
            leave={{ animation: 'slideUp' }}>
            {this.state.toggleChevron && this.props.children}
          </VelocityTransitionGroup>
        </div>
      </div>
    )
  }
}
