import React from 'react'

const Vehicle = ({ vehicle }: { vehicle: any }): JSX.Element => {
  return (
    <div
      className="header stop-view"
      style={{
        backgroundColor: 'green',
        color: 'pink'
      }}
    >
      {vehicle.network}
    </div>
  )
}

export default Vehicle
