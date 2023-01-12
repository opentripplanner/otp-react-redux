import { useIntl } from 'react-intl'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

type Props = {
  children: JSX.Element
  id: string
  pullRight?: boolean
  style?: { [key: string]: any }
  title: JSX.Element
}

const DropdownButton = styled.a`
  border: none;
  display: block;
  color: inherit;
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
  cursor: default;
  color: #111;
  float: left;
  list-style: none;
  margin: 2px 0 0;
  min-width: 160px;
  padding: 5px 0;
  position: absolute;
  right: 0;
  text-align: left;
  top: 100%;
  z-index: 1000;

  hr {
    padding: 0;
    margin: 0;
  }
  li {
    padding: 5px 15px;
    cursor: pointer;
  }
  li.header {
    cursor: default;
  }
  li:not(.header):hover {
    background: rgba(0, 0, 0, 0.1);
  }
`
const DropdownContainer = styled.li``

const Dropdown = ({
  children,
  id,
  pullRight,
  style,
  title
}: Props): JSX.Element => {
  const intl = useIntl()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  useEffect(() => {
    // TODO: TYPE
    const handleClick = (e: any) => {
      if (
        !!containerRef.current &&
        // @ts-expect-error Typescript doesn't like this check
        !(containerRef?.current).contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [containerRef])

  return (
    <DropdownContainer
      id={`${id}-wrapper`}
      ref={containerRef}
      role="presentation"
      style={{ float: pullRight ? 'right' : 'left' }}
    >
      <DropdownButton
        aria-controls={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={intl.formatMessage({ id: 'components.SubNav.userMenu' })}
        className={`${open && 'active'}`}
        id={`${id}-label`}
        onClick={() => setOpen(!open)}
        role="combobox"
        style={style}
        tabIndex={0}
      >
        {title}
        <span className="caret" style={{ marginLeft: 5 }} />
      </DropdownButton>
      {open && (
        <DropdownMenu
          aria-labelledby={`${id}-label`}
          id={id}
          role="listbox"
          tabIndex={-1}
        >
          {children}
        </DropdownMenu>
      )}
    </DropdownContainer>
  )
}

export default Dropdown
