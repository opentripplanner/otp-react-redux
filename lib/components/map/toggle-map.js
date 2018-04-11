import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ButtonGroup, Button } from 'react-bootstrap'

import LegDiagram from './leg-diagram'

class ToggleMap extends Component {
  constructor () {
    super()
    this.state = {
      visibleChild: 0
    }
  }

  render () {
    const { diagramLeg } = this.props

    const showDiagram = diagramLeg

    return (
      <div className='map-container'>
        {this.props.children.map((child, i) => {
          return (
            <div key={i}
              className='map-container'
              style={{ visibility: i === this.state.visibleChild ? 'visible' : 'hidden' }}
            >
              {this.props.children[i]}
            </div>
          )
        })}

        {/* The toggle buttons */}
        <div style={{ position: 'absolute', bottom: 12 + (showDiagram ? 192 : 0), left: 12, zIndex: 100000 }}>
          <ButtonGroup>
            {this.props.children.map((child, i) => {
              return (
                <Button
                  key={i}
                  bsSize='xsmall'
                  bsStyle={i === this.state.visibleChild ? 'success' : 'default'}
                  style={{ padding: '3px 6px' }}
                  onClick={() => { this.setState({ visibleChild: i }) }}
                >
                  {child.props.toggleLabel}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>

        {/* The leg diagram overlay, if active */}
        {showDiagram && <LegDiagram leg={diagramLeg} />}
      </div>
    )
  }
}

// Connect to Redux store

const mapStateToProps = (state, ownProps) => {
  return { diagramLeg: state.otp.ui.diagramLeg }
}

export default connect(mapStateToProps)(ToggleMap)
