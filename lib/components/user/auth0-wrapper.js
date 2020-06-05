import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useAuth } from 'use-auth0-hooks'

import { getAuth0Config } from '../../util/auth'
import { AUTH0_SCOPE } from '../../util/constants'
import { renderChildrenWithProps } from '../../util/ui'

import Auth0TokenWrapper from './auth0-token-wrapper'

/**
 * This component enhances the functionality of withAuth/useAuth().
 * It can wait for an auth0 accessToken to be available before displaying a component that is token-dependent.
 * It passes the accessToken and other auth props to the token-dependent component.
 * (The Auth0TokenWrapper component handles getting the token.)
 *
 * Note: using withAuth() would require access to a reliable path to config.yml (not the case in trimet-mod-otp),
 * and on-demand use of the useAuth() hook is only permitted in a purely functional component.
 * So, this component gets auth0 props and passes that as a prop to eligible children elements.
 * Also, because of the hook constraint, this element is unable to
 * obtain an accessToken on its own, so we use Auth0TokenWrapper for that task.
 */
const Auth0Wrapper = props => {
  const { children, awaitToken, persistence } = props
  if (getAuth0Config(persistence)) {
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

  return children
}

Auth0Wrapper.propTypes = {
  /**
   * Determines whether to await for a token to be fetched.
   * Does not apply if no user is logged in.
   */
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

export default connect(mapStateToProps, mapDispatchToProps)(Auth0Wrapper)
