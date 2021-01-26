import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import Icon from '../narrative/icon'

const Container = styled.div``

const BackToTripPlanner = () => (
  <Container>
    <Link to='/'><Icon name='arrow-left' />  Back to trip planner</Link>
  </Container>
)

export default BackToTripPlanner
