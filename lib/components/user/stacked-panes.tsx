import React from 'react'

import { PageHeading, StackedPaneContainer } from './styled'

export interface PaneAttributes {
  hidden?: boolean
  pane: React.ElementType
  props?: any
  title?: string | JSX.Element
}

export interface Props {
  canceling?: boolean
  panes: PaneAttributes[]
  title: string | JSX.Element
}

/**
 * Stacked layout of panes, each supporting a title and a cancel state.
 */
const StackedPanes = ({ canceling, panes, title }: Props): JSX.Element => (
  <>
    <PageHeading>{title}</PageHeading>
    {panes.map(
      ({ hidden, pane: Pane, props, title }, index) =>
        !hidden && (
          <StackedPaneContainer key={index}>
            {title && <h3>{title}</h3>}
            <div>
              <Pane canceled={canceling} {...props} />
            </div>
          </StackedPaneContainer>
        )
    )}
  </>
)

export default StackedPanes
