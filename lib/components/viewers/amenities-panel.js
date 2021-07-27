import React, { Component } from 'react'

import RelatedPanel from './related-panel'

class AmenitiesPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { expanded } = this.state
    return (
      <RelatedPanel
        expanded={expanded}
        onToggleExpanded={this._toggleExpandedView}
        title='Nearby Amenities'
      >
        Nearby amenities go here.
      </RelatedPanel>
    )
  }
}

export default AmenitiesPanel
