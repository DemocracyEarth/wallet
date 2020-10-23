import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import Dapp from 'components/Dapp/Dapp';
import { config } from 'config';

ReactGA.initialize(config.keys.analytics, { debug: true });
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
  document.getElementById('root')
);

// serviceWorker.register();
