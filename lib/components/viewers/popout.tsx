import { createPortal } from 'react-dom'
import React, { useEffect, useRef } from 'react'

function WindowPortal({ children, onClose }) {
  const newWindow = useRef<Window | null>(null)
  const container = useRef(document.createElement('div'))

  // TODO amy type pls
  let intervalId

  function closeAndClear() {
    onClose()
    clearInterval(intervalId)
  }

  useEffect(() => {
    newWindow.current = window.open('', '', 'width=700, height=400')

    if (!newWindow.current) {
      console.log('error')
    }

    const win = newWindow.current
    win?.document?.body?.appendChild(container.current)

    intervalId = setInterval(() => {
      win?.closed && closeAndClear()
    }, 100)
  }, [])

  return createPortal(children, container.current)
}

export default WindowPortal
