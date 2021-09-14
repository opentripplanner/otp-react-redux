import React from 'react'
import { Col, Row } from 'react-bootstrap'

import DesktopNav from './desktop-nav'
import NotFound from './not-found'

/**
 * This component defines the general application frame, to which
 * content and an optional sub-navigation component can be inserted.
 */
const AppFrame = ({ children, SubNav }) => (
  <div className='otp' id='otp' role='main'>
    {/* TODO: Do mobile view. */}
    <DesktopNav />
    {SubNav && <SubNav />}
    <div className='container'>
      <Row xs={12}>
        <Col md={8} mdOffset={2} sm={10} smOffset={1} xs={12}>
          {children}
        </Col>
      </Row>
    </div>
  </div>
)

/**
 * Creates a simple wrapper component consisting of an AppFrame that surrounds
 * the provided component. (Displays "Content not found" if none provided.)
 */
export function frame (Component) {
  return () => (
    <AppFrame>
      {Component
        ? <Component />
        : <NotFound />
      }
    </AppFrame>
  )
}

export default AppFrame
