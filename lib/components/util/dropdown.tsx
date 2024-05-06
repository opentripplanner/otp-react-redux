import React, {
  HTMLAttributes,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { getEntryRelativeTo } from './get-entry-relative-to'
import { NavbarButton } from '../app/nav-item'
import styled from 'styled-components'

interface Props extends HTMLAttributes<HTMLElement> {
  id: string
  label?: string
  listLabel?: string
  name?: JSX.Element | string
  nav?: boolean
  pullRight?: boolean
}

const DropdownButton = styled(NavbarButton)``

const DropdownMenu = styled.ul`
  background-clip: padding-box;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  color: #111;
  list-style: none;
  margin: 2px 0 0;
  min-width: 160px;
  padding: 5px 0;
  position: absolute;
  right: 0;
  top: 100%;
  width: 100%;
  z-index: 1000;

  hr {
    margin: 0;
    padding: 0;
  }
  a,
  button,
  li.header {
    padding: 5px 15px;
    text-align: start;
    width: 100%;
  }
  a,
  button {
    cursor: pointer;
  }
  li.header {
    cursor: default;
    font-weight: 600;
  }
  li:not(.header):hover {
    background: rgba(0, 0, 0, 0.1);
  }
`

/**
 * Renders a dropdown menu. By default, only a passed "name" is rendered. If clicked,
 * a floating div is rendered below the "name" with list contents inside. Clicking anywhere
 * outside the floating div will close the dropdown.
 */
export const Dropdown = ({
  children,
  className,
  id,
  label,
  listLabel,
  name,
  pullRight,
  style
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLLIElement>(null)

  const toggleOpen = useCallback(() => setOpen(!open), [open, setOpen])

  // Argument for document.querySelectorAll to target focusable elements.
  const queryId = `#${id} button, #${id}-label`

  // Adding document event listeners allows us to close the dropdown
  // when the user interacts with any part of the page that isn't the dropdown
  useEffect(() => {
    const handleExternalAction = (e: Event): void => {
      if (!containerRef?.current?.contains(e.target as HTMLElement)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleExternalAction)
    document.addEventListener('focusin', handleExternalAction)
    document.addEventListener('keydown', handleExternalAction)
    return () => {
      document.removeEventListener('mousedown', handleExternalAction)
      document.removeEventListener('focusin', handleExternalAction)
      document.removeEventListener('keydown', handleExternalAction)
    }
  }, [containerRef])

  const _handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      const element = e.target as HTMLElement
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          getEntryRelativeTo(queryId, element, -1)?.focus()
          break
        case 'ArrowDown':
          e.preventDefault()
          getEntryRelativeTo(queryId, element, 1)?.focus()
          break
        case 'Escape':
          setOpen(false)
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          element.click()
          if (element.id === `${id}-label` || element.id === `${id}-wrapper`) {
            toggleOpen()
          }
          break
        default:
      }
    },
    [id, toggleOpen]
  )

  return (
    <span
      className={className}
      id={`${id}-wrapper`}
      onKeyDown={_handleKeyDown}
      ref={containerRef}
      role="presentation"
      style={{ float: pullRight ? 'right' : 'left' }}
    >
      <DropdownButton
        // Only set aria-controls when the dropdown is open
        // (otherwise, assistive technologies may not announce the dropdown correctly).
        aria-controls={open ? id : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={`${open && 'active'}`}
        id={`${id}-label`}
        onClick={toggleOpen}
        style={style}
        tabIndex={0}
        title={label}
      >
        <span>{name}</span>
        <span className="caret" role="presentation" />
      </DropdownButton>
      {open && (
        <DropdownMenu
          aria-label={listLabel}
          aria-labelledby={listLabel ? undefined : `${id}-label`}
          id={id}
          onClick={toggleOpen}
          role="list"
          tabIndex={-1}
        >
          {children}
        </DropdownMenu>
      )}
    </span>
  )
}

export const SortResultsDropdown = styled(Dropdown)`
    position: relative;

    ${DropdownButton} {
      border-radius: 5px;
      padding: 3px 7px;
      background: #F8FAFB;
      color: inherit;

      span.caret {
        color: inherit;
      }

      &:hover {
        background: #fff;
        color: inherit;
      }
      &.active {
        background: #fff;
      }
    }
  }
`
