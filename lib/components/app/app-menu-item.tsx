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
 * Helper method to find the element within the app menu at the given offset
 * (e.g. previous or next) relative to the specified element.
 * The query is limited to the app menu so that arrow navigation is contained within
 * (tab navigation is not restricted).
 */
function getEntryRelative(element, offset) {
  const entries = Array.from(
    document.querySelectorAll('.app-menu a, .app-menu button')
  )
  const elementIndex = entries.indexOf(element)
  return entries[elementIndex + offset]
}

/**
 * Renders a single entry from the hamburger menu.
 */
export default class AppMenuItem extends Component<Props, State> {
  state = {
    isExpanded: false
  }

  _handleKeyDown = ({ key, target }: KeyboardEvent): void => {
    switch (key) {
      case 'ArrowLeft':
        this.setState({ isExpanded: false })
        break
      case 'ArrowUp':
        getEntryRelative(target, -1)?.focus()
        break
      case 'ArrowRight':
        this.setState({ isExpanded: true })
        break
      case 'ArrowDown':
        getEntryRelative(target, 1)?.focus()
        break
      case ' ':
        // For links (tagName "A" uppercase), trigger link on space for consistency with buttons.
        if (target.tagName === 'A') target.click()
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
    const Element = otherProps.href ? 'a' : 'button'
    return (
      <>
        <Element
          // TODO: add aria-expanded, controls etc.
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
        </Element>
        {subItems && (
          <AnimateHeight duration={500} height={isExpanded ? 'auto' : 0}>
            {/* TODO Add group role */}
            <div className="sub-menu-container">{subItems}</div>
          </AnimateHeight>
        )}
      </>
    )
  }
}
