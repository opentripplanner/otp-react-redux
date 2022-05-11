import { Button } from 'react-bootstrap'
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { useIntl } from 'react-intl'
import React, { useEffect, useState } from 'react'

import Icon from '../util/icon'

const MapillaryFrame = ({
  onClose,
  url
}: {
  onClose?: () => void
  url: string
}): React.ReactElement => {
  const intl = useIntl()
  const [fakeLoad, setFakeLoad] = useState(false)
  useEffect(() => {
    // If the ID changed, show a "fake" loading screen to indicate to the user
    // something is happening
    setFakeLoad(true)
    setTimeout(() => setFakeLoad(false), 500)
  }, [url])

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
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <img
          alt={intl.formatMessage({ id: 'components.Mapillary.altText' })}
          src={`${url}`}
          style={{
            height: '100%',
            visibility: fakeLoad ? 'hidden' : 'visible'
          }}
        />
      </div>
      <Button
        aria-label="Close"
        className="mapillary-close-button close-button clear-button-formatting"
        onClick={onClose}
      >
        <i className="fa fa-close" />
      </Button>
    </div>
  )
}

export default MapillaryFrame
