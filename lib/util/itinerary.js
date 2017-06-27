import React from 'react'

import ModeIcon from '../components/icons/mode-icon'

/**
 * @param  {string}  mode
 * @return {boolean}
 */
export function isTransit (mode) {
  const transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA', 'TRAINISH', 'BUSISH']
  return transitModes.indexOf(mode) !== -1
}

export function isWalk (mode) {
  mode = mode || this.get('mode')
  return mode === 'WALK'
}

export function isBicycle (mode) {
  mode = mode || this.get('mode')
  return mode === 'BICYCLE'
}

export function isBicycleRent (mode) {
  mode = mode || this.get('mode')
  return mode === 'BICYCLE_RENT'
}

export function isCar (mode) {
  mode = mode || this.get('mode')
  return mode === 'CAR'
}

export function isAccessMode (mode) {
  return isWalk(mode) || isBicycle(mode) || isBicycleRent(mode) || isCar(mode)
}

export function getMapColor (mode) {
  mode = mode || this.get('mode')
  if (mode === 'WALK') return '#444'
  if (mode === 'BICYCLE') return '#0073e5'
  if (mode === 'SUBWAY') return '#f00'
  if (mode === 'RAIL') return '#b00'
  if (mode === 'BUS') return '#080'
  if (mode === 'TRAM') return '#800'
  if (mode === 'FERRY') return '#008'
  if (mode === 'CAR') return '#444'
  return '#aaa'
}

export function getStepInstructions (step) {
  return `${step.relativeDirection} on ${step.streetName}`
}

export function getModeIcon (mode, customIcons) {
  if (customIcons && mode in customIcons) {
    return customIcons[mode]
  }
  return <ModeIcon mode={mode} />
}
