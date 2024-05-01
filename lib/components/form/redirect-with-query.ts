import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import { AppReduxState } from '../../util/state-types'

interface OwnProps {
  to: string
}

// For connecting to the redux store
const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  return {
    to: {
      pathname: ownProps.to,
      search: state.router.location.search
    }
  }
}

export default connect(mapStateToProps)(Redirect)
