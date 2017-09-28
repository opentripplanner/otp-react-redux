import React, { Component, PropTypes } from 'react'

import { ButtonGroup, Button } from 'react-bootstrap'

export default class ToggleMap extends Component {

  constructor () {
    super()
    this.state = {
      visibleChild: 0
    }
  }

  render () {
    return (
      <div className='map-container'>
        {this.props.children.map((child, i) => {
          return (
            <div className='map-container' style={{ visibility: i === this.state.visibleChild ? 'visible' : 'hidden' }}>
              {this.props.children[i]}
            </div>
          )
        })}
        <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 100000 }}>
          <ButtonGroup>
            {this.props.children.map((child, i) => {
              return (
                <Button
                  bsSize='xsmall'
                  bsStyle={ i === this.state.visibleChild ? 'success' : 'default' }
                  style={{ padding: '3px 6px' }}
                  onClick={() => { this.setState({ visibleChild: i }) }}
                >
                  {child.props.toggleName}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>
      </div>
    )
  }
}
