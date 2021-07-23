import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ButtonGroup, Button } from 'react-bootstrap'

import DefaultMap from './default-map'
import LegDiagram from './leg-diagram'
import StylizedMap from './stylized-map'

class Map extends Component {
  constructor () {
    super()
    this.state = {
      activeViewIndex: 0
    }
  }

  getComponentForView (view) {
    // TODO: allow a 'CUSTOM' type
    switch (view.type) {
      case 'DEFAULT': return <DefaultMap />
      case 'STYLIZED': return <StylizedMap />
    }
  }

  render () {
    const { diagramLeg, mapConfig } = this.props

    const showDiagram = diagramLeg

    // Use the views defined in the config; if none defined, just show the default map
    const views = mapConfig.views || [{ type: 'DEFAULT' }]

    return (
      <div className='map-container'>
        {/* The map views -- only one is visible at a time */}
        {views.map((view, i) => {
          return (
            <div className='map-container'
              key={i}
              style={{ visibility: i === this.state.activeViewIndex ? 'visible' : 'hidden' }}
            >
              {this.getComponentForView(view)}
            </div>
          )
        })}

        {/* The toggle buttons -- only show if multiple views */}
        {views.length > 1 && (
          <div style={{ bottom: 12 + (showDiagram ? 192 : 0), left: 12, position: 'absolute', zIndex: 100000 }}>
            <ButtonGroup>
              {views.map((view, i) => {
                return (
                  <Button
                    bsSize='xsmall'
                    bsStyle={i === this.state.activeViewIndex ? 'success' : 'default'}
                    key={i}
                    onClick={() => { this.setState({ activeViewIndex: i }) }}
                    style={{ padding: '3px 6px' }}
                  >
                    {view.text || view.type}
                  </Button>
                )
              })}
            </ButtonGroup>
          </div>
        )}

        {/* The leg diagram overlay, if active */}
        {showDiagram && <LegDiagram leg={diagramLeg} />}
      </div>
    )
  }
}

// Connect to Redux store

const mapStateToProps = (state, ownProps) => {
  return {
    diagramLeg: state.otp.ui.diagramLeg,
    mapConfig: state.otp.config.map
  }
}

export default connect(mapStateToProps)(Map)
