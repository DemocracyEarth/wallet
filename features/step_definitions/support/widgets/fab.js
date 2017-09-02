/**
 * Floating Action Button
 * @type {Widget}
 */
class FabWidget extends widgets.Base {

  get selectors() { return {
    self: '#action',
  }; }

}

widgets.fab = new FabWidget();