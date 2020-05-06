import React, { Children, isValidElement, cloneElement } from 'react'
import { connect } from 'react-redux'
import { useAuth, withLoginRequired } from 'use-auth0-hooks'

import { AUTH0_SCOPE } from '../../util/constants'

/**
 * This class just gets auth0 props and forwards them to
 * UserAccountScreen.
 */
const Auth0Wrapper = props => {
  const { children, persistence } = props
  const auth = useAuth({
    audience: persistence.auth0.audience,
    scope: AUTH0_SCOPE
  })

  // Add auth prop to eligible children elements.
  // Copied from
  // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children#32371612
  const childrenWithProps = Children.map(children, child => {
    // Checking isValidElement is the safe way and avoids a TS error too.
    if (isValidElement(child)) {
      return cloneElement(child, { auth })
    }

    return child
  })

  return <>{childrenWithProps}</>
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
}

export default withLoginRequired(
  connect(mapStateToProps, mapDispatchToProps)(Auth0Wrapper)
)
