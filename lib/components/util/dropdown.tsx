import React, {
  HTMLAttributes,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'

interface Props extends HTMLAttributes<HTMLElement> {
  label?: string
  listLabel?: string
  name: JSX.Element
  pullRight?: boolean
}

// TODO: make this a button once bootstrap is removed
const DropdownButton = styled.a`
  border: none;
  color: inherit;
  display: block;
  transition: all 0.1s ease-in-out;

  &:hover {
    background: rgba(0, 0, 0, 0.05) !important;
    cursor: pointer;
  }
  &.active {
    background: rgba(0, 0, 0, 0.1) !important;
  }
`
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
const DropdownContainer = styled.li``

/**
 * Renders a dropdown menu. By default, only a passed "name" is rendered. If clicked,
 * a floating div is rendered below the "name" with list contents inside. Clicking anywhere
 * outside the floating div will close the dropdown.
 */
const Dropdown = ({
  children,
  id,
  label,
  listLabel,
  name,
  pullRight,
  style
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLLIElement>(null)

  const toggleOpen = () => setOpen(!open)

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

  const _handleKeyDown = (e: KeyboardEvent): void => {
    const element = e.target as HTMLElement
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        getEntryRelativeTo(element, -1)?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        getEntryRelativeTo(element, 1)?.focus()
        break
      case 'Escape':
        setOpen(false)
        break
      case ' ':
      case 'Enter':
        element.click()
        if (element.id === `${id}-label` || element.id === `${id}-wrapper`) {
          toggleOpen()
        }
        break
      default:
    }
  }

  /**
   * Helper method to find the element within dropdown menu at the given offset
   * (e.g. previous or next) relative to the specified element.
   * The query is limited to the dropdown so that arrow navigation is contained within
   * (tab navigation is not restricted).
   */
  function getEntryRelativeTo(
    element: EventTarget,
    offset: 1 | -1
  ): HTMLElement {
    const entries = Array.from(
      document.querySelectorAll(`#${id} button, #${id}-label`)
    )
    const elementIndex = entries.indexOf(element as HTMLElement)

    return entries[elementIndex + offset] as HTMLElement
  }

  return (
    <DropdownContainer
      id={`${id}-wrapper`}
      onKeyDown={_handleKeyDown}
      ref={containerRef}
      style={{ float: pullRight ? 'right' : 'left' }}
    >
      <DropdownButton
        aria-controls={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={`${open && 'active'}`}
        id={`${id}-label`}
        onClick={toggleOpen}
        role="button"
        style={style}
        tabIndex={0}
      >
        {name}
        <span className="caret" role="presentation" style={{ marginLeft: 5 }} />
      </DropdownButton>
      {open && (
        <DropdownMenu
          aria-label={listLabel}
          aria-labelledby={listLabel ? '' : `${id}-label`}
          id={id}
          onClick={toggleOpen}
          role="list"
          tabIndex={-1}
        >
          {children}
        </DropdownMenu>
      )}
    </DropdownContainer>
  )
}

export default Dropdown
