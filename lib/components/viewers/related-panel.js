import React, { Component } from 'react'

class RelatedPanel extends Component {
  render () {
    const { children, count, expanded, title } = this.props
    return (
      <>
        <h4 className='related-panel-title'>{title}</h4>
        <div className='related-panel-container'>
          {children}
        </div>
        {count > 2 && (
          <button
            className='related-panel-expand-view'
            onClick={this.props.onToggleExpanded}
          >
            {expanded
              ? 'Hide extra stops'
              : 'Show ' + (count - 2) + ' extra stops'
            }
          </button>
        )}
      </>
    )
  }
}

export default RelatedPanel
