import React from 'react'
import { Col, Row } from 'react-bootstrap'

import DesktopNav from '../app/desktop-nav'
import SubNav from './sub-nav'

/**
 * This component contains common navigation elements and wrappers and should
 * wrap any user account page (e.g., SavedTripList or account settings).
 */
const AccountPage = ({children, subnav = true}) => (
  <div className='otp'>
    {/* TODO: Do mobile view. */}
    <DesktopNav />
    {subnav && <SubNav />}
    <div className='container'>
      <Row xs={12}>
        <Col xs={12} sm={10} smOffset={1} md={8} mdOffset={2}>
          {children}
        </Col>
      </Row>
    </div>
  </div>
)

export default AccountPage
