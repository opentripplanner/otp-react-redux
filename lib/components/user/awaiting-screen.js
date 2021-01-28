import React from 'react'

import Loading from '../narrative/loading'

/**
 * Screen that is flashed while retrieving user data.
 * TODO: Improve this screen.
 */
const AwaitingScreen = () => (
  <div className='text-center' style={{marginTop: '150px'}}>
    <Loading />
  </div>
)

export default AwaitingScreen
