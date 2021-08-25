import React, { Component } from 'react'
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group'

import Icon from '../narrative/icon'

export class MenuItem extends Component {
  state = {
    expanded: false,
    toggleChevron: false
  }

  _toggleChevron = () => {
    const toggleChevron = this.state.toggleChevron
    this.setState({ toggleChevron: !toggleChevron })
  }

  render () {
    const {
      containsSubmenu,
      icon,
      iconUrl,
      isSubmenuItem,
      navTitle,
      onClick,
      url
    } = this.props
    return (
      <div className='menu-container'>
        <div className={'menu-item'}>
          {iconUrl === undefined &&
            <Icon type={icon} />
          }
          <span className={'menu-item-title'}>
            {iconUrl && <img alt={`Icon for ${navTitle}`} src={iconUrl} />}
            <button className={isSubmenuItem ? 'menu-item-button sub-menu-item-button' : 'menu-item-button'} onClick={onClick}>
              {url
                ? <a href={url}>{navTitle}</a>
                : navTitle}
            </button>
          </span>
          <div className='expansion-button-container'>
            {containsSubmenu && (
              <button className='menu-expansion-button' onClick={this._toggleChevron}>
                <Icon type={`chevron-${this.state.toggleChevron ? 'up' : 'down'}`} />
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
