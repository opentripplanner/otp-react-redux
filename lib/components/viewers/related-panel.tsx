import { FormattedMessage } from 'react-intl'
import React from 'react'

type Props = {
  children: React.ReactNode
  count: number
  expanded?: boolean
  onToggleExpanded: () => void
  title?: string
  titleWidth?: number
}

function RelatedPanel({
  children,
  count,
  expanded,
  onToggleExpanded,
  title
}: Props): JSX.Element {
  return (
    <div className="related-panel-container">
      <h2>{title}</h2>
      {children}
      {count > 2 && (
        <button
          className="related-panel-expand-view"
          onClick={onToggleExpanded}
        >
          {expanded ? (
            <FormattedMessage id="components.RelatedPanel.hideExtraStops" />
          ) : (
            <FormattedMessage
              id="components.RelatedPanel.showExtraStops"
              values={{ count: count - 2 }}
            />
          )}
        </button>
      )}
    </div>
  )
}

export default RelatedPanel
