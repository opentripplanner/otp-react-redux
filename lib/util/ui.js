export function isMobile () {
  // TODO: consider using 3rd-party library?
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
