import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Icon from '../narrative/icon'

const Container = styled.div``

const BackToTripPlanner = ({ queryParams }) => (
  <Container>
    <Link to={{ pathname: '/', search: queryParams }}>
      <Icon name='arrow-left' />  Back to trip planner
    </Link>
  </Container>
)

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    queryParams: state.router.location.search
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(BackToTripPlanner)
