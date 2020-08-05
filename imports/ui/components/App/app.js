import { Template } from 'meteor/templating';

import App from '/imports/ui/components/App/App.jsx';

import '/imports/ui/components/App/app.html';

Template.app.helpers({
  App() {
    return App;
  },
});

