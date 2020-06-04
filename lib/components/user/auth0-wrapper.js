import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useAuth, withLoginRequired } from 'use-auth0-hooks'

import { renderChildrenWithProps } from '../../util/ui'
import { AUTH0_SCOPE } from '../../util/constants'

import Auth0TokenWrapper from './auth0-token-wrapper'

/**
 * This component exists because using the use-auth0-hooks's own withAuth() wrapper is not possible
 * (we don't have access to state.otp.config in the global scope, and there is no reliable path to config.yml),
 * and because on-demand use of the useAuth() hook is only permitted in a purely functional component.
 * So, this component gets auth0 props and passes that as a prop to eligible children elements.
 * Also, because of the hook constraint, this element is unable to
 * obtain an accessToken on its own, so we use Auth0TokenWrapper for that task.
 */
const Auth0Wrapper = props => {
  const { children, awaitToken, persistence } = props
  const auth = useAuth({
    audience: persistence.auth0.audience,
    scope: AUTH0_SCOPE
  })
  const childrenWithAuth = renderChildrenWithProps(children, { auth })

  if (awaitToken) {
    return (
      <Auth0TokenWrapper auth={auth}>
        {childrenWithAuth}
      </Auth0TokenWrapper>
    )
  }

  return childrenWithAuth
}

Auth0Wrapper.propTypes = {
  /** Determines whether to await for a token to be fetched. */
  awaitToken: PropTypes.bool
}

Auth0Wrapper.defaultProps = {
  awaitToken: true
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
