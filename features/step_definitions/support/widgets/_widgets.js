import {getBrowser} from '../utils';

/**
 * Base class for all widgets.
 * To the best of our ability, these widgets should be stateless,
 * except maybe for when there are multiple identical widgets in the page and we want to target one in particular.
 */
class Widget {

  constructor() {
    //this.selectors = {};
  }

  click() {
    if ( ! this.selectors.self) { throw new Error("No selector for `self`."); }
    getBrowser().waitForExist(this.selectors.self);
    getBrowser().click(this.selectors.self);
  }

}


global.widgets = {
  Base: Widget
};