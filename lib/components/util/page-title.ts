import { connect } from 'react-redux'
import { useEffect } from 'react'

interface Props {
  appTitle: string
  title: string
}

/**
 * Invisible component that sets the page title appended with the app title.
 */
const PageTitle = ({ appTitle, title }: Props) => {
  useEffect(() => {
    document.title = title + ' | ' + appTitle

    // Restore the app title as the page title when the component unmounts.
    // (This will cause a side effect if PageTitle appears on a component and its descendents.)
    return () => {
      document.title = appTitle
    }
  }, [appTitle, title])

  // Component renders nothing
  return null
}

/** Default app title from index.html, evaluated once at startup. */
const defaultTitle = document.title

// connect to redux store

const mapStateToProps = (state: any) => {
  return {
    appTitle: state.otp.config.title || defaultTitle
  }
}

export default connect(mapStateToProps)(PageTitle)
