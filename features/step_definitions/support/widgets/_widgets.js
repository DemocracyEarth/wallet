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


/**
 * Instances and classes of widgets may be accessed via this variable.
 *
 * We'll mostly use the default instances, but in case we want to create ours in the future, let's have both.
 *
 * UpperCased properties are class definitions
 * lowerCased properties are instances of said classes
 *
 * The base widget does not get an instance, it's abstract.
 */
global.widgets = {
  Base: Widget
};