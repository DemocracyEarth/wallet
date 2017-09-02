/**
 * Floating Action Button
 * @type {Widget}
 */
class FabWidget extends widgets.Base {

  get selectors() { return {
    self: '#action',
  }; }

}

widgets.Fab = FabWidget;
widgets.fab = new FabWidget();