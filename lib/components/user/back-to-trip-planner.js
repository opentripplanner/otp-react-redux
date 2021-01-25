import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Container = styled.div``

const BackToTripPlanner = () => (
  <Container>
    <Link to='/'>← Back to trip planner</Link>
  </Container>
)

export default BackToTripPlanner
