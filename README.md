<p align="center">
<img src="public/images/democracy-earth.png" width="400" title="Democracy Earth Foundation">
</p>

# Sovereign

Governance for Digital Organizations.

[![Join the chat at https://gitter.im/DemocracyEarth/sovereign](https://badges.gitter.im/DemocracyEarth/sovereign.svg)](https://gitter.im/DemocracyEarth/sovereign?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Slack Status](http://chat.democracy.earth/badge.svg)](http://chat.democracy.earth)
[![Build Status](http://ci.comunes.org/buildStatus/icon?job=sovereign)](http://ci.comunes.org/job/sovereign/)

Read our 📃 [white paper](https://github.com/DemocracyEarth/paper) and check our recent conferences in [Paris 🇫🇷 2016](https://youtube.com/watch?v=UajbQTHnTfM) and [Berlin 🇩🇪 2018](https://youtu.be/xqafNk_VsMM).

<p align="center">
<img src="public/images/sovereign-screenshot-2018.png" width="800" title="Sovereign Screenshot 2018">
</p>

## Features

  - [X] On-chain and Off-chain voting.
    * Tipping
    * Coin voting
    * Quadratic voting.
  - [X] Supports [ERC20](https://github.com/ethereum/eips/issues/20) and [ERC721](https://github.com/ethereum/eips/issues/721) tokens.    
  - [X] Social networking tools for deliberation.
  - [X] Mobile & desktop responsive UX.
  - [X] Server-based web tokens.
  - [X] Templates and governance settings.
  - [X] Built for EVM-compatible blockchains with [Web3](https://github.com/ethereum/web3.js/).

**Release:**

* Currently [`version 0.5.2`](https://github.com/DemocracyEarth/sovereign/releases)
* This [User Agreement](https://github.com/DemocracyEarth/sovereign/blob/master/UserAgreement.md) governs access to and use of the Democracy Earth platform.

## Setup

0. **Install Framework**

    On Linux & MacOS, load a terminal and type:

    ```sh
    $ curl https://install.meteor.com/ | sh
    ```

    This will setup [Meteor](https://github.com/meteor/meteor) (including [Node](https://github.com/nodejs/node) and [Mongo](https://github.com/mongodb/mongo) if necessary).

    > _Note:_ Windows users must [download installer](https://www.meteor.com/install).

0. **Clone Repository**

    ```sh
    $ git clone https://github.com/DemocracyEarth/sovereign.git
    $ cd sovereign
    ```

0. **Install Dependencies**

    if you have npm installed, type:

    ```sh
    $ npm install
    ```

    if you only have meteor, type:

    ```sh
    $ meteor npm install
    ```

0. **Run App**

    While in repository directory type:

    ```sh
    $ meteor npm run start:dev
    ```

    Load browser and go to [http://localhost:3000/](http://localhost:3000/).

    > _Note:_ For production deploys you should use:
    > ``` $ meteor npm run start ```
    > check production/settings.json file to config your keys.

0. **Configure**

    * Check `/config/development/settings.json` to configure Sovereign for your organization's governance needs.
    * On `/public/templates/` different template style folders are available. The file `templateName.json` can be configured and a css design can be found on `/public/templates/name/css` folder.

## Live

* Democracy Earth: [democracy.earth](https://democracy.earth).
* Decentraland: [agora.decentraland.org](https://agora.decentraland.org).
* Blockstack: [vote.blockstack.org](https://vote.blockstack.org).

### Reports

* Report on [2016 Colombia Referendum](https://medium.com/@DemocracyEarth/a-digital-referendum-for-colombias-diaspora-aeef071ec014#.xbyqt3blq).
* OECD Report on [Blockchain Voting for Peace](https://www.oecd.org/gov/innovative-government/embracing-innovation-in-government-colombia.pdf).
* Quadratic Voting for the [2019-2020 Legislative Season of the State of Colorado](https://www.bloomberg.com/news/articles/2019-05-01/a-new-way-of-voting-that-makes-zealotry-expensive).

## Specifications

* Built with [Meteor](https://github.com/meteor/meteor) version 1.8.1
* Check our [documentation](http://docs.democracy.earth) for further technical reference (work in progress).

**Supported Browsers:**

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](https://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 4 versions| last 4 versions| last 4 versions| last 4 versions


## Contribute

Sovereign is a **free & open source project**.

* Check our [contributors list](https://github.com/DemocracyEarth/sovereign/graphs/contributors).
* If you want to collaborate with pull requests (features, fixes, issues, projects), please follow our [contributing guidelines](CONTRIBUTING.md).
* Available tasks in the [to do list](TODO.md) to join.
* Also you can find our projects and tasks in the [project area](https://github.com/DemocracyEarth/sovereign/projects).

### Backers:

Join our [Open Collective](https://opencollective.com/democracyearth):

<a href="https://opencollective.com/democracyearth/backer/0/website"><img src="https://opencollective.com/democracyearth/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/1/website"><img src="https://opencollective.com/democracyearth/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/2/website"><img src="https://opencollective.com/democracyearth/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/3/website"><img src="https://opencollective.com/democracyearth/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/4/website"><img src="https://opencollective.com/democracyearth/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/5/website"><img src="https://opencollective.com/democracyearth/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/6/website"><img src="https://opencollective.com/democracyearth/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/7/website"><img src="https://opencollective.com/democracyearth/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/8/website"><img src="https://opencollective.com/democracyearth/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/9/website"><img src="https://opencollective.com/democracyearth/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/10/website"><img src="https://opencollective.com/democracyearth/backer/10/avatar.svg"></a>

Support our work with [Bitcoin](https://github.com/bitcoin) & other cryptocurrencies:

<p align="left">
<img src="public/images/qr.png" width="100" title="Democracy Earth Foundation BTC Address">
</p>

* BTC Address: `1BtQMS7snrisEFMB1fMecXPyeHwwcWnpGE`
* ETH Address: `0xE3670E862850D58E0af745d06021c1c0555235dF`

## About

Democracy Earth Foundation is a _501 (c) 3 not for profit corporation_ in San Francisco, California with no political affiliations. Our partners include:

<p align="left">
<a href="https://ycombinator.com"><img src="public/images/yc.png" width="200" title="Y Combinator"></a>
<a href="https://ffwd.org"><img src="public/images/ffwd.png" width="200" title="Fast Forward"></a>
</p>

Also check our [donors list](DONORS.md).

## License

This software is under an [MIT License](LICENSE.md).
Some rights reserved, 2015 - 2019 [Democracy Earth Foundation](https://democracy.earth).
