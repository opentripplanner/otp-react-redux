import { connect } from 'react-redux'
import { useEffect } from 'react'

interface Props {
  appTitle: string
  title?: string
}

/**
 * Invisible component that changes the title to the specified text.
 * (It will append the configured app title to the end.)
 */
const PageTitle = ({ appTitle, title }: Props): null => {
  useEffect(() => {
    document.title = title + ' | ' + appTitle
  }, [appTitle, title])

  // Component renders nothing
  return null
}

// connect to redux store

const mapStateToProps = (state: any) => {
  return {
    appTitle: state.otp.config.title // or the default one
  }
}

export default connect(mapStateToProps)(PageTitle)
