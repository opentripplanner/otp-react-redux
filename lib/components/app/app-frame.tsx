import { Col, Row } from 'react-bootstrap'
import React, { ComponentType, FC, HTMLAttributes } from 'react'

import DesktopNav from './desktop-nav'
import NotFound from './not-found'

interface Props extends HTMLAttributes<HTMLDivElement> {
  SubNav?: ComponentType
}

/**
 * This component defines the general application frame, to which
 * content and an optional sub-navigation component can be inserted.
 */
const AppFrame = ({ children, SubNav }: Props): JSX.Element => (
  <div className="otp" id="otp">
    {/* TODO: Do mobile view. */}
    <DesktopNav />
    {SubNav && <SubNav />}
    {/* Create a main region here so that the DesktopNav, which contains a "banner" landmark,
        is not contained within the main or other landmark
        (see https://dequeuniversity.com/rules/axe/4.3/landmark-banner-is-top-level?application=axe-puppeteer) */}
    <main tabIndex={-1}>
      <div className="container">
        <Row>
          <Col md={8} mdOffset={2} sm={10} smOffset={1} xs={12}>
            {children}
          </Col>
        </Row>
      </div>
    </main>
  </div>
)

/**
 * Creates a simple wrapper component consisting of an AppFrame that surrounds
 * the provided component. (Displays "Content not found" if none provided.)
 */
export function frame(Component: ComponentType): FC {
  const FramedComponent = () => (
    <AppFrame>{Component ? <Component /> : <NotFound />}</AppFrame>
  )
  return FramedComponent
}

export default AppFrame
