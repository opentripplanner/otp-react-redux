import React from 'react'

function RelatedPanel ({ children, count, expanded, onToggleExpanded, title }) {
  return (
    <>
      <h4 className='related-panel-title'>{title}</h4>
      <div className='related-panel-container'>
        {children}
      </div>
      {count > 2 && (
        <button
          className='related-panel-expand-view'
          onClick={onToggleExpanded}
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

export default RelatedPanel
