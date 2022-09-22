import { Button } from 'react-bootstrap'
import { Spinner } from '@styled-icons/fa-solid/Spinner'
import { Times } from '@styled-icons/fa-solid/Times'
import React, { useEffect, useState } from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

const MapillaryFrame = ({
  id,
  onClose
}: {
  id: string
  onClose?: () => void
}): React.ReactElement => {
  const [fakeLoad, setFakeLoad] = useState(false)
  useEffect(() => {
    // If the ID changed, show a "fake" loading screen to indicate to the user
    // something is happening
    setFakeLoad(true)
    setTimeout(() => setFakeLoad(false), 750)
  }, [id])

  return (
    <div className="leg-diagram" style={{ height: '50vh', zIndex: 999 }}>
      <div
        style={{
          alignItems: 'center',
          display: fakeLoad ? 'flex' : 'none',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <StyledIconWrapper size="2x" spin>
          <Spinner />
        </StyledIconWrapper>
      </div>
      <iframe
        frameBorder="0"
        src={`https://www.mapillary.com/embed?image_key=${id}&style=photo`}
        style={{
          display: fakeLoad ? 'none' : 'block',
          height: '100%',
          width: '100%'
        }}
        title="Imagery of the street"
      />
      <Button
        aria-label="Close"
        className="mapillary-close-button close-button clear-button-formatting"
        onClick={onClose}
      >
        <StyledIconWrapper>
          <Times />
        </StyledIconWrapper>
      </Button>
    </div>
  )
}

export default MapillaryFrame
