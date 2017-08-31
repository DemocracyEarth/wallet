import {log, getBrowser} from '../utils';

function ModalWidget() {
  const selectors = {
    self: '#modalToggle',
    confirm: '#execute',
  };

  this.confirm = () => {
    log("Confirming modal…");
    getBrowser().waitForVisible(selectors.self);
    getBrowser().waitForVisible(selectors.confirm);
    getBrowser().element(selectors.confirm).click();
    // Wait for the modal to disappear as it prevents clicking on other parts of the page in further steps.
    getBrowser().waitForVisible(selectors.self, 5000, true);
  }
}

widgets.modal = new ModalWidget();