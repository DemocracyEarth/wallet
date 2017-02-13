import { Template } from 'meteor/templating';

import './blockchainLogin.html';
import BlockchainLogin from './BlockchainLogin.jsx';

Template.blockchainLogin.helpers({
  BlockchainLogin() {
    return BlockchainLogin;
  },
});
