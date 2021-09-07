/**
 * This file performs some actions to setup the browser environment used in each
 * jest test.
 */

window.localStorage = {
  getItem: () => null
}
