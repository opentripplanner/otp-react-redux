import React from 'react'

import { PageHeading, StackedPaneContainer } from './styled'

export interface Props {
  canceling?: boolean
  panes: any[]
  title: string | JSX.Element
}

/**
 * This component handles the flow between screens for new OTP user accounts.
 *
 * TODO: add types once Pane type exists
 */
const StackedPanes = ({ canceling, panes, title }: Props): JSX.Element => (
  <>
    <PageHeading>{title}</PageHeading>
    {panes.map(
      ({ hidden, pane: Pane, props, title }, index) =>
        !hidden && (
          <StackedPaneContainer key={index}>
            <h3>{title}</h3>
            <div>
              <Pane canceled={canceling} {...props} />
            </div>
          </StackedPaneContainer>
        )
    )}
  </>
)

export default StackedPanes
