import React, {PropTypes, Component} from 'react'
import FontAwesome from 'react-fontawesome'

export default class Icon extends Component {
  static propTypes = {
    // type: PropTypes.string.required
  }
  render () {
    return (
      <FontAwesome
        name={this.props.type}
        fixedWidth
        {...this.props}
        />)
  }
}
