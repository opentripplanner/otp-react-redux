/**
 * This file performs some actions to setup the browser environment used in each
 * jest test.
 */

import 'regenerator-runtime/runtime'

window.localStorage = {
  getItem: () => null,
};
