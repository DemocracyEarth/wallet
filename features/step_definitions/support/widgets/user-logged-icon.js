/**
 * Logged User  Button
 * @type {Widget}
 */
class LoggedUserButton extends widgets.Base {
  get selectors() {
    return {
      self: '#loggedUser',
    };
  }
}

widgets.LoggedUserButton = LoggedUserButton;
widgets.loggedUserButton = new LoggedUserButton();
