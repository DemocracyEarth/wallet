import {getBrowser} from '../utils';

/**
 * Base class for all widgets.
 * To the best of our ability, these widgets should be stateless,
 * except maybe for when there are multiple identical widgets in the page and we want to target one in particular.
 */
class Widget {

  constructor() {}

  get selectors() { return {}; }

  click() {
    if ( ! this.selectors.self) { throw new Error("No selector for `self`."); }
    getBrowser().waitForExist(this.selectors.self);
    getBrowser().click(this.selectors.self);
  }

}


/**
 * Instances and classes of widgets must be registered into this map, to may be accessed in the step definitions.
 *
 * We'll mostly use the default instances, but in case we want to create ours in the future, let's have both :
 *
 *   - UpperCased properties are class definitions
 *   - lowerCased properties are instances of said classes
 *
 * The base widget does not get an instance, let's say it's abstract.
 */
global.widgets = {
  Base: Widget
};