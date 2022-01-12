import { Button } from 'react-bootstrap'
import React from 'react'

const MapillaryFrame = ({
  id,
  onClose
}: {
  id: string
  onClose?: () => void
}): React.ReactElement => {
  return (
    <div className="leg-diagram" style={{ height: '50vh', zIndex: 999 }}>
      <iframe
        frameBorder="0"
        src={`https://www.mapillary.com/embed?image_key=${id}&style=photo`}
        style={{ height: '100%', width: '100%' }}
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
