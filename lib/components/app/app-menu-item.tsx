import { ChevronDown } from '@styled-icons/fa-solid/ChevronDown'
import { ChevronUp } from '@styled-icons/fa-solid/ChevronUp'

import { getEntryRelativeTo } from '../util/get-entry-relative-to'
import AnimateHeight from 'react-animate-height'
import Link from '../util/link'

import React, { Component, HTMLAttributes, KeyboardEvent } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  href?: string
  icon?: JSX.Element
  onClick?: () => void
  subItems?: JSX.Element[]
  text: JSX.Element | string
  to?: string
}

interface State {
  isExpanded: boolean
}
// Argument for document.querySelectorAll to target focusable elements.
const queryId = '.app-menu a, .app-menu button'

/**
 * Renders a single entry from the hamburger menu.
 */
export default class AppMenuItem extends Component<Props, State> {
  state = {
    isExpanded: false
  }

  _handleKeyDown = (e: KeyboardEvent): void => {
    const { subItems } = this.props
    const element = e.target as HTMLElement
    switch (e.key) {
      case 'ArrowLeft':
        subItems && this.setState({ isExpanded: false })
        break
      case 'ArrowUp':
        getEntryRelativeTo(queryId, element, -1)?.focus()
        break
      case 'ArrowRight':
        subItems && this.setState({ isExpanded: true })
        break
      case 'ArrowDown':
        getEntryRelativeTo(queryId, element, 1)?.focus()
        break
      case ' ':
        // For links (tagName "A" uppercase), trigger link on space for consistency with buttons.
        element.tagName === 'A' && element.click()
        break
      default:
    }
  }

  _toggleSubmenu = (): void => {
    this.setState({ isExpanded: !this.state.isExpanded })
  }

  render(): JSX.Element {
    const { icon, id, onClick, subItems, text, ...otherProps } = this.props
    const { isExpanded } = this.state
    const hasHref = !!otherProps.href
    const isAbsolute = otherProps.href?.startsWith('http')
    const Element = hasHref ? 'a' : otherProps.to ? Link : 'button'
    const containerId = `${id}-container`
    return (
      <>
        <Element
          aria-controls={subItems && containerId}
          aria-expanded={subItems && isExpanded}
          className="navItem"
          id={id}
          onClick={subItems ? this._toggleSubmenu : onClick}
          onKeyDown={this._handleKeyDown}
          {...otherProps}
          target={hasHref && isAbsolute ? '_blank' : undefined}
          title={typeof text === 'string' ? text : ''}
        >
          <span aria-hidden>{icon}</span>
          <span>{text}</span>
          {subItems && (
            <span className="expand-menu-chevron">
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </span>
          )}
        </Element>
        {subItems && (
          <AnimateHeight duration={500} height={isExpanded ? 'auto' : 0}>
            <div className="sub-menu-container" id={containerId} role="group">
              {subItems}
            </div>
          </AnimateHeight>
        )}
      </>
    )
  }
}
