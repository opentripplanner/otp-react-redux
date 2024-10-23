import React from 'react'
import styled from 'styled-components'

import { PageHeading, StackedPaneContainer } from './styled'

const Summary = styled.summary`
  /* Revert display:block set by Bootstrap that hides the native expand/collapse caret. */
  display: revert-layer;
  font-size: 24px;
  /* Format summary as labels */
  font-weight: 500;
  margin-bottom: 0.5em;
  margin-top: 0.5em;

  &::before {
    content: '';
    display: inline-block;
    width: 0.5em; /* Adjust this value to increase or decrease space */
  }
`

export interface PaneAttributes {
  collapsible?: boolean
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
      ({ collapsible, hidden, pane: Pane, props, title }, index) =>
        !hidden && (
          <StackedPaneContainer key={index}>
            {collapsible ? (
              <details>
                <Summary>{title}</Summary>
                <Pane canceled={canceling} {...props} />
              </details>
            ) : (
              <>
                {title && <h3>{title}</h3>}
                <div>
                  <Pane canceled={canceling} {...props} />
                </div>
              </>
            )}
          </StackedPaneContainer>
        )
    )}
  </>
)

export default StackedPanes
