import React from 'react';
import ReactDOM from 'react-dom';

import Dapp from 'components/Dapp/Dapp';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
