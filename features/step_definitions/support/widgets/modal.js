import {log, getBrowser} from '../utils';

class ModalWidget extends widgets.Base {

  get selectors() { return {
    self: '#modalToggle',
    confirm: '#execute',
  }; }

  confirm () {
    log("Confirming modal…");
    getBrowser().waitForVisible(this.selectors.self);
    getBrowser().waitForVisible(this.selectors.confirm);
    getBrowser().element(this.selectors.confirm).click();
    // Wait for the modal to disappear as it prevents clicking on other parts of the page in further steps.
    getBrowser().waitForVisible(this.selectors.self, 5000, true);
  }
}

widgets.Modal = ModalWidget;
widgets.modal = new ModalWidget();