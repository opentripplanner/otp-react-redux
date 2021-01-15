import React from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import styled from 'styled-components'

import { ACCOUNT_SETTINGS_PATH, TRIPS_PATH } from '../../util/constants'

const Container = styled.div`
  border-bottom: solid 1px #adadad;
  margin-bottom: 25px;
  padding: 5px 0px 10px 0px;
`

const Links = styled.div`
  margin-top: 11px;

  .btn-link {
    font-size: 17px;
    margin-left: 8px;
    padding: 0px 3px;
    border-bottom: 3px solid transparent;
  }

  .btn-link.active {
    border: none;
    border-bottom: 3px solid #adadad;
  }
`

/**
 * This component renders the sub navigation elements for Account pages.
 */
const SubNav = ({title = 'My account'}) => (
  <Container>
    <div className='container'>
      <h1 style={{display: 'inline', paddingTop: '10px'}}>{title}</h1>
      <Links className='pull-right'>
        <LinkContainer to={TRIPS_PATH}>
          <Button bsStyle='link'>Trips</Button>
        </LinkContainer>
        <LinkContainer to={ACCOUNT_SETTINGS_PATH}>
          <Button bsStyle='link'>Settings</Button>
        </LinkContainer>
      </Links>
    </div>
  </Container>
)

export default SubNav
