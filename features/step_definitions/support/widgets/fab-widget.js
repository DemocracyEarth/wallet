import { getBrowser } from '../utils';

function FabWidget() {
    const selectors = {
        self: '#action'
    };

    this.click = () => {
        getBrowser().waitForExist(selectors.self);
        getBrowser().click(selectors.self);
    }
}

widgets.fab = new FabWidget();