import { Button } from 'react-bootstrap'
import { Spinner } from '@styled-icons/fa-solid/Spinner'
import { Times } from '@styled-icons/fa-solid/Times'
import { useIntl } from 'react-intl'
import core from '@opentripplanner/core-utils'
import React, { useEffect, useState } from 'react'

import { MapillaryConfig } from '../../util/config-types'
import { StyledIconWrapper } from '../util/styledIcon'

const { mapillary } = core

const MapillaryFrame = ({
  id,
  mapillaryConfig,
  onClose
}: {
  id: string
  mapillaryConfig: MapillaryConfig
  onClose?: () => void
}): React.ReactElement => {
  const intl = useIntl()
  const [fakeLoad, setFakeLoad] = useState(false)
  useEffect(() => {
    // If the ID changed, show a "fake" loading screen to indicate to the user
    // something is happening
    setFakeLoad(true)
    setTimeout(() => setFakeLoad(false), 750)
  }, [id])

  const closeLabel = intl.formatMessage({ id: 'common.forms.close' })
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
        src={mapillary.generateUrlForProvider[
          mapillaryConfig?.provider || 'MAPILLARY'
        ](id)}
        style={{
          display: fakeLoad ? 'none' : 'block',
          height: '100%',
          width: '100%'
        }}
        title={intl.formatMessage({ id: 'components.MapillaryFrame.title' })}
      />
      <Button
        aria-label={closeLabel}
        className="mapillary-close-button close-button clear-button-formatting"
        onClick={onClose}
        title={closeLabel}
      >
        <StyledIconWrapper>
          <Times />
        </StyledIconWrapper>
      </Button>
    </div>
  )
}

export default MapillaryFrame
