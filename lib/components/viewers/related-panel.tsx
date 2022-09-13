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
  title,
  titleWidth
}: Props): JSX.Element {
  return (
    <>
      <h4 className="related-panel-title" style={{ width: titleWidth }}>
        {title}
      </h4>
      <div className="related-panel-container">{children}</div>
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
    </>
  )
}

export default RelatedPanel
