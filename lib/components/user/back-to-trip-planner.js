import React from 'react'
import styled from 'styled-components'

import { LinkWithQuery } from '../form/connected-links'
import Icon from '../narrative/icon'

const Container = styled.div``

const BackToTripPlanner = () => (
  <Container>
    <LinkWithQuery to={'/'}>
      <Icon name='arrow-left' />  Back to trip planner
    </LinkWithQuery>
  </Container>
)

export default BackToTripPlanner
