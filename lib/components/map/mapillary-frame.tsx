import { Button } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'

// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import Icon from '../util/icon'

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
        <Icon className="fa-spin" type="spinner" />
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
        className="mapillary-close-button close-button clear-button-formatting"
        onClick={onClose}
      >
        <i className="fa fa-close" />
      </Button>
    </div>
  )
}

export default MapillaryFrame
