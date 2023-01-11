import { ChevronDown } from '@styled-icons/fa-solid/ChevronDown'
import { ChevronUp } from '@styled-icons/fa-solid/ChevronUp'
import AnimateHeight from 'react-animate-height'
import React, { Component, HTMLAttributes, KeyboardEvent } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  href?: string
  icon?: JSX.Element
  isDropdown?: boolean
  onClick?: () => void
  subItems?: unknown[]
}

interface State {
  isExpanded
}

/**
 * Renders a single entry from the hamburger menu.
 */
export default class AppMenuItem extends Component<Props, State> {
  state = {
    isExpanded: false
  }

  _handleKeyDown = (e: KeyboardEvent): void => {
    console.log('keydown', e)
    switch (e.keyCode) {
      case 38: // arrow up
        e.target.previousSibling?.focus()
        break
      case 40: // arrow down
        e.target.nextSibling?.focus()
        break
      default:
    }
  }

  _toggleSubmenu = (): void => {
    this.setState({ isExpanded: !this.state.isExpanded })
  }

  render(): JSX.Element {
    const { icon, onClick, subItems, text, ...otherProps } = this.props
    const { isExpanded } = this.state
    const Comp = otherProps.href ? 'a' : 'button'
    return (
      <>
        <Comp
          onClick={subItems ? this._toggleSubmenu : onClick}
          onKeyDown={this._handleKeyDown}
          {...otherProps}
        >
          <span>{icon}</span>
          <span>{text}</span>
          {subItems && (
            <span className="expand-menu-chevron">
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </span>
          )}
        </Comp>
        {subItems && (
          <AnimateHeight duration={500} height={isExpanded ? 'auto' : 0}>
            <div className="sub-menu-container">{subItems}</div>
          </AnimateHeight>
        )}
      </>
    )
  }
}
