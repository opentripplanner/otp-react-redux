import { ChevronDown } from '@styled-icons/fa-solid/ChevronDown'
import { ChevronUp } from '@styled-icons/fa-solid/ChevronUp'
import React, { Component, HTMLAttributes, KeyboardEvent } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  href?: string
  icon?: JSX.Element
  isDropdown?: boolean
  isExpanded?: boolean
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

  render(): JSX.Element {
    const { icon, isDropdown, isExpanded, text, ...otherProps } = this.props
    const Comp = otherProps.href ? 'a' : 'button'
    return (
      <Comp onKeyDown={this._handleKeyDown} {...otherProps}>
        <span>{icon}</span>
        <span>{text}</span>
        {isDropdown && (
          <span className="expand-menu-chevron">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </span>
        )}
      </Comp>
    )
  }
}
