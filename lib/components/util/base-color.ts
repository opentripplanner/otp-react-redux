import tinycolor, { Instance } from 'tinycolor2'

export const getBaseColor = (): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(
    '--main-base-color'
  )
}

export const getDarkenedBaseColor = (): Instance => {
  return tinycolor(getBaseColor()).darken(10)
}
