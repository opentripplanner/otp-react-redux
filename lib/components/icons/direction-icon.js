import React, { Component } from 'react'

export default class DirectionIcon extends Component {
  render () {
    const { relativeDirection } = this.props
    if (!relativeDirection) return null
    switch (relativeDirection.toUpperCase()) {
      case 'DEPART':
      case 'CONTINUE': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path id='path5143' d='M100.5,110.5v150h60v-150h40l-70-110-70,110h40Z' />
        </svg>
      )
      case 'LEFT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M374.5,100.5h60v160h60V90.5c0-30-20-50-50-50h-70V0.5l-100,69.14,100,70.86v-40Z' transform='translate(-260 0)' />
        </svg>
      )
      case 'RIGHT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M406.5,140.5l100-70.86L406.5,0.5v40h-70c-30,0-50,20-50,50v170h60v-160h60v40Z' transform='translate(-260)' />
        </svg>
      )
      case 'SLIGHTLY_LEFT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M346.5,350.5l40,40c10,10,20,20,20,40v90h60v-90c0-40-20-60-40-80l-40-40,30-30-120-20,20,120Z' transform='translate(-260 -260)' />
        </svg>
      )
      case 'SLIGHTLY_RIGHT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M464.5,380.5l20-120-120,20,30,30-40,40c-20,20-40,40-40,80v90h60v-90c0-20,10-30,20-40l40-40Z' transform='translate(-260 -260)' />
        </svg>
      )
      case 'HARD_LEFT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M592.5,360.5l50-50c40-40,110-20,110,50v160h-60v-160c0-10,0-20-10-10l-50,50,30,30-120,20,20-120Z' transform='translate(-520 -260)' />
        </svg>
      )
      case 'HARD_RIGHT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M738.5,330.5l20,120-120-20,30-30-50-50c-10-10-10,0-10,10v160h-60v-160c0-70,70-90,110-50l50,50Z' transform='translate(-520 -260)' />
        </svg>
      )
      case 'UTURN_LEFT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M628.5,120.5v-20c0-34.81,3.93-40.31,35.36-40s34.64,4.46,34.64,40v160h60v-160c0-74.12-22.85-97.25-94.64-97.5S568.5,25,568.5,100.5v20h-40l70,100,70-100h-40Z' transform='translate(-520)' />
        </svg>
      )
      case 'UTURN_RIGHT': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M632.5,120.5l70,100,70-100h-40v-20C732.5,25,708.93,2.75,637.14,3S542.5,26.38,542.5,100.5v160h60v-160c0-35.54,3.21-39.69,34.64-40s35.36,5.19,35.36,40v20h-40Z' transform='translate(-520 0)' />
        </svg>
      )
      case 'CIRCLE_CLOCKWISE': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <linearGradient id='gradient' x1='160.77' y1='640.4' x2='220.77' y2='580.4' gradientTransform='translate(320.5 1250.14) rotate(180)' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' style={{ stopColor: '#aaa', stopOpacity: 1 }} />
            <stop offset='100%' style={{ stopColor: '#aaa', stopOpacity: 0 }} />
          </linearGradient>
          <path d='M30.5,640.5h60a40,40,0,0,1,80,0c0,20.22-10.51,37.32-30,40,15,5,25,20,25,50,37.37-14.48,65-47.51,65-90A100,100,0,0,0,30.5,640.5Z' transform='translate(0 -520)' fill='url(#gradient)' />
          <path d='M0.5,660.5h32a100.12,100.12,0,0,0,68,75.41V780.5h60v-60c0-20-15-40-40-40-10.05,0-20.09-8-25.62-20H120.5l-60-60Z' transform='translate(0 -520)' />
        </svg>
      )
      case 'CIRCLE_COUNTERCLOCKWISE': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <linearGradient id='gradient' x1='160.77' y1='640.4' x2='220.77' y2='580.4' gradientTransform='matrix(1, 0, 0, -1, -59.5, 1250.14)' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' style={{ stopColor: '#aaa', stopOpacity: 1 }} />
            <stop offset='100%' style={{ stopColor: '#aaa', stopOpacity: 0 }} />
          </linearGradient>
          <path d='M130.5,540.5a100,100,0,0,0-100,100c0,42.49,27.63,75.52,65,90,0-30,10-45,25-50-19.49-2.68-30-19.78-30-40a40,40,0,0,1,80,0h60A100,100,0,0,0,130.5,540.5Z' transform='translate(0 -520)' fill='url(#gradient)' />
          <path d='M200.5,600.5l-60,60h25.63c-5.54,12-15.57,20-25.62,20-25,0-40,20-40,40v60h60V735.91a100.12,100.12,0,0,0,68-75.41h32Z' transform='translate(0 -520)' />
        </svg>
      )
      case 'ELEVATOR': return (
        <svg viewBox='0 0 261 261' height='100%' width='100%'>
          <path d='M376.93,520.5v43.28H340.41a36.79,36.79,0,0,0-36.72,36.72v140a36.77,36.77,0,0,0,36.72,36.69h100a36.74,36.74,0,0,0,36.69-36.69v-140a36.77,36.77,0,0,0-36.69-36.72H404.79V520.5H376.93Zm-32.52,60.69h92a23.1,23.1,0,0,1,23.28,23.31v132a23.08,23.08,0,0,1-23.28,23.28h-92a23.1,23.1,0,0,1-23.31-23.28v-132A23.13,23.13,0,0,1,344.41,581.19Zm1,24.31v75h-20l35.06,60,34.94-60h-20v-75h-30Zm75.06-5-35.06,60h20v75h30v-75h20Z' transform='translate(-260 -520)' />
        </svg>
      )
    }
    return null
  }
}
