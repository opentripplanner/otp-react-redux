import { createPortal } from 'react-dom'
import React, { ReactPortal, useEffect, useRef, useState } from 'react'

interface PortalWrapperProps {
  children: React.ReactNode
  onClose: () => void
  title: string
}

/** Copies all of the style elements from the source document to the target
 * document
 */
const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
  Array.from(
    sourceDoc.querySelectorAll('link[rel="stylesheet"], style')
  ).forEach((link) => {
    targetDoc.head.appendChild(link.cloneNode(true))
  })
}

/** Injects the node ref into the newly created window upon load
 */
const onLoad = (
  windowRef: React.MutableRefObject<Window | null>,
  nodeRef: React.MutableRefObject<HTMLElement>,
  title: string,
  setIsLoading: (loading: boolean) => void
) => {
  if (windowRef.current) {
    windowRef.current.document.body.appendChild(nodeRef.current)
    windowRef.current.document.title = title
  }
  setIsLoading(false)
}

const PortalWrapper = (props: PortalWrapperProps): ReactPortal | null => {
  const { children, onClose, title } = props

  // Create a node to inject the React Portal into
  const nodeRef = useRef<HTMLElement>(document.createElement('div'))

  // Create a ref to hold the newly opened window
  const windowRef = useRef<Window | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Set up a mutation observer that copies the styles from the main application to the React portal
  // every time the DOM is mutated. Without this, new elements that are added to the portal DOM after
  // the initial render will not pick up the styles that were previously injected from the main application.
  // For example, if a button is clicked that adds more components to a styled table, the new components would
  // not retain the styling of the rest of the table unless the styles are re-copied
  const observer = new MutationObserver(() => {
    if (!isLoading && windowRef.current)
      copyStyles(document, windowRef.current.document)
  })
  const mainWindowBody = windowRef.current?.document.querySelector('body')
  if (mainWindowBody)
    observer.observe(mainWindowBody, { childList: true, subtree: true })

  useEffect(() => {
    windowRef.current = window.open(
      undefined,
      undefined,
      'width=1000,height=800'
    )

    if (windowRef.current) {
      windowRef.current.addEventListener('beforeunload', () => {
        onClose()
      })

      // If the window finishes loading extremely quickly, we will be too late in appending the
      // 'load' event listener. In that case, call the onLoad function manually
      if (windowRef.current.document.readyState === 'complete') {
        onLoad(windowRef, nodeRef, title, setIsLoading)
      } else {
        windowRef.current.addEventListener('load', () =>
          onLoad(windowRef, nodeRef, title, setIsLoading)
        )
      }
    }

    return () => {
      observer.disconnect()
      windowRef.current?.close()
      windowRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isLoading ? null : createPortal(children, nodeRef.current)
}

export default PortalWrapper
