import { Component, PropTypes } from 'react'

export default class NarrativeItinerary extends Component {
  static propTypes = {
    active: PropTypes.bool,
    activeLeg: PropTypes.number,
    activeStep: PropTypes.number,
    expanded: PropTypes.bool,
    index: PropTypes.number,
    itinerary: PropTypes.object,
    onClick: PropTypes.func,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  _onHeaderClick = () => {
    const { active, index, onClick, setActiveItinerary } = this.props
    if (onClick) {
      onClick()
    } else if (!active) {
      setActiveItinerary(index)
    } else {
      setActiveItinerary(null)
    }
  }

  render () {
    throw new Error('render() called on abstract class NarrativeItinerary')
  }
}
