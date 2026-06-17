import { createPortal } from 'react-dom'
import React, { useEffect, useRef, useState } from 'react'

interface WindowPortalProps {
  children: React.ReactNode
  onClose: () => void
}

function WindowPortal({
  children,
  onClose
}: WindowPortalProps): React.ReactPortal | null {
  const newWindow = useRef<Window | null>(null)
  const container = useRef(document.createElement('div'))
  const [externalWindow, setExternalWindow] = useState<Window | null>(null)

  // TODO amy type pls
  let intervalId: number

  function closeAndClear() {
    onClose()
    clearInterval(intervalId)
  }

  useEffect(() => {
    newWindow.current = window.open('', '', 'width=700, height=400')

    if (!newWindow.current) {
      console.log('error')
      return
    }

    setExternalWindow(newWindow.current)

    const win = newWindow.current

    const sourceStyles = document.querySelectorAll(
      'style, link[rel="stylesheet"]'
    )

    sourceStyles.forEach((styleNode) => {
      win?.document?.head.appendChild(styleNode.cloneNode(true))
    })

    win?.document?.body?.appendChild(container.current)

    // TODO: address warning here
    intervalId = setInterval(() => {
      win?.closed && closeAndClear()
    }, 100)
  }, [])

  return externalWindow ? createPortal(children, container.current) : null
}

export default WindowPortal
