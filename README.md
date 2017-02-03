<p align="center">
<img src="public/images/democracy-earth.png" width="400" title="Democracy Earth Foundation">
</p>

# Sovereign.app

[![Join the chat at https://gitter.im/DemocracyEarth/sovereign](https://badges.gitter.im/DemocracyEarth/sovereign.svg)](https://gitter.im/DemocracyEarth/sovereign?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Slack Status](https://chat.democracy.earth/badge.svg)](https://chat.democracy.earth)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/599/badge)](https://bestpractices.coreinfrastructure.org/projects/599)

Sovereign is a decentralized governance platform for small & large organizations.

See our 🇫🇷 [Paris 2016 conference](http://youtube.com/watch?v=UajbQTHnTfM) presentation.

<p align="center">
<img src="public/images/sovereign-screenshot.png" width="800" title="Sovereign Screenshot">
</p>

**Features:**

  - [X] Liquid democracy toolkit:
    * Voting & delegation of votes.
    * Ballots with multiple options.
    * Bottom-up system of proposals.
  - [X] Transaction engine based on voting tokens (_currently blockchain agnostic_).
  - [X] Mobile & desktop responsive UX.

**Roadmap:**

  - [ ] Decentralized identity key management 🔗 with [Blockstack](https://github.com/blockstack/blockstack).
  - [ ] Institutional incorporation via smart contracts 🔗 with [Open Zeppelin](https://github.com/OpenZeppelin/zeppelin-solidity).
  - [ ] Bitcoin integration for budgeting 🔗 with [Bcoin](https://github.com/bcoin-org/bcoin).
  - [ ] Distributed resource storage 🔗 with [IPFS](https://github.com/ipfs/js-ipfs).
  - [ ] Native desktop client 🔗 with [Electron](https://github.com/electron/electron).

**Release:**

[`version 0.1.0`](https://github.com/DemocracyEarth/sovereign/milestone/1)

📃 [Universal Declaration of Human Rights](https://en.wikipedia.org/wiki/Universal_Declaration_of_Human_Rights):

>   _Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers. Everyone has the right to freedom of peaceful assembly and association. Everyone has the right to take part in the government of his country, directly or through freely chosen representatives._


Built for [personal sovereignty](https://www.amazon.com/Sovereign-Individual-Mastering-Transition-Information/dp/0684832720) ✊.

## Setup

0. **Install Framework**

    On Linux & MacOS, load a terminal and type:

    ```sh
    $ curl https://install.meteor.com/ | sh
    ```

    This will setup [Meteor](http://github.com/meteor/meteor) (including [Node](https://github.com/nodejs/node) and [Mongo](https://github.com/mongodb/mongo) if necessary).

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

    Load browser and go to [http://localhost:3000/](http://localhost:3000/) 🔥

    > _Note:_ For production deploys you should use:  
    > ``` $ meteor npm run start ```
    > check production/settings.json file to config your keys.

0. **Start a Revolution**

    Persuade members of any organization you belong to try sovereign governance. [Tell us about it](mailto:hello@democracy.earth) so we can learn from the experience and improve our work.

    > _Note:_ To begin a movement check our paper _[How to start a Net Party](http://www.slideshare.net/santisiri/how-to-make-a-net-party)_.

    🕊

## Demos

Implementations:

* 🌎 Official Site: [democracy.earth](http://democracy.earth).
* 🇨🇴 Report on [Colombia Referendum](https://medium.com/@DemocracyEarth/a-digital-referendum-for-colombias-diaspora-aeef071ec014#.xbyqt3blq).

> _Note:_ Live deploy coming soon.

## Specifications

Built on [Meteor](https://www.meteor.com/) version 1.4.2

* Rapid cross platform deployment (web + desktop + mobile).
* Simple code structure.
* Fast and reliable stack (node + mongo).

Designed with [Webflow](https://www.webflow.com).

Check our [documentation](https://github.com/DemocracyEarth/sovereign/tree/master/docs) for technical reference.

**Supported Browsers:**

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 4 versions| last 4 versions| last 4 versions| last 4 versions


## Contribute

Sovereign is a **free & open source project**.

Check our [contributors list](https://github.com/DemocracyEarth/sovereign/graphs/contributors).

If you want to collaborate with pull requests (features, fixes, issues, projects), please follow our [contributing guidelines](CONTRIBUTING.md).

Available tasks in the [to do list](TODO.md) to join.

Also you can find our projects and tasks in the [project area](https://github.com/DemocracyEarth/sovereign/projects).

### Backers:

Join our [Open Collective](https://opencollective.com/democracyearth):

<a href="https://opencollective.com/democracyearth/backer/0/website"><img src="https://opencollective.com/democracyearth/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/1/website"><img src="https://opencollective.com/democracyearth/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/2/website"><img src="https://opencollective.com/democracyearth/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/3/website"><img src="https://opencollective.com/democracyearth/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/4/website"><img src="https://opencollective.com/democracyearth/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/democracyearth/backer/5/website"><img src="https://opencollective.com/democracyearth/backer/5/avatar.svg"></a>

Support our work with [Bitcoin](https://github.com/bitcoin) & other cryptocurrencies:

<p align="left">
<img src="public/images/qr.png" width="100" title="Democracy Earth Foundation BTC Address">
</p>

* BTC Address: `1BtQMS7snrisEFMB1fMecXPyeHwwcWnpGE`
* ETH Address: `0xE3670E862850D58E0af745d06021c1c0555235dF`

## Manifesto

📃 [A Declaration of the Independence of Cyberspace]((https://www.eff.org/es/cyberspace-independence)):

>Governments of the Industrial World, you weary giants of flesh and steel, I come from Cyberspace, the new home of Mind. On behalf of the future, I ask you of the past to leave us alone. You are not welcome among us. You have no sovereignty where we gather.

>We have no elected government, nor are we likely to have one, so I address you with no greater authority than that with which liberty itself always speaks. I declare the planetary social space we are building to be naturally independent of the tyrannies you seek to impose on us. You have no moral right to rule us nor do you possess any methods of enforcement we have true reason to fear.

>Governments derive their just powers from the consent of the governed. You have neither solicited nor received ours. We did not invite you. You do not know us, nor do you know our world. Cyberspace does not lie within your borders. Do not think that you can build it, as though it were a public construction project. You cannot. It is an act of nature and it grows itself through our collective actions.

>You have not engaged in our great and gathering conversation, nor did you create the wealth of our marketplaces. You do not know our culture, our ethics, or the unwritten codes that already provide our society more order than could be obtained by any of your impositions.

>You claim there are problems among us that you need to solve. You use this claim as an excuse to invade our precincts. Many of these problems don't exist. Where there are real conflicts, where there are wrongs, we will identify them and address them by our means. We are forming our own Social Contract. This governance will arise according to the conditions of our world, not yours. Our world is different.

>Cyberspace consists of transactions, relationships, and thought itself, arrayed like a standing wave in the web of our communications. Ours is a world that is both everywhere and nowhere, but it is not where bodies live.

>We are creating a world that all may enter without privilege or prejudice accorded by race, economic power, military force, or station of birth.

>We are creating a world where anyone, anywhere may express his or her beliefs, no matter how singular, without fear of being coerced into silence or conformity.

>Your legal concepts of property, expression, identity, movement, and context do not apply to us. They are all based on matter, and there is no matter here.

>Our identities have no bodies, so, unlike you, we cannot obtain order by physical coercion. We believe that from ethics, enlightened self-interest, and the commonweal, our governance will emerge. Our identities may be distributed across many of your jurisdictions. The only law that all our constituent cultures would generally recognize is the Golden Rule. We hope we will be able to build our particular solutions on that basis. But we cannot accept the solutions you are attempting to impose.

>In the United States, you have today created a law, the Telecommunications Reform Act, which repudiates your own Constitution and insults the dreams of Jefferson, Washington, Mill, Madison, DeToqueville, and Brandeis. These dreams must now be born anew in us.

>You are terrified of your own children, since they are natives in a world where you will always be immigrants. Because you fear them, you entrust your bureaucracies with the parental responsibilities you are too cowardly to confront yourselves. In our world, all the sentiments and expressions of humanity, from the debasing to the angelic, are parts of a seamless whole, the planetary conversation of bits. We cannot separate the air that chokes from the air upon which wings beat.

>In China, Germany, France, Russia, Singapore, Italy and the United States, you are trying to ward off the virus of liberty by erecting guard posts at the frontiers of Cyberspace. These may keep out the contagion for a small time, but they will not work in a world that will soon be blanketed in bit-bearing media.

>Your increasingly obsolete information industries would perpetuate themselves by proposing laws, in America and elsewhere, that claim to own speech itself throughout the world. These laws would declare ideas to be another industrial product, no more noble than pig iron. In our world, whatever the human mind may create can be reproduced and distributed infinitely at no cost. The planetary conveyance of thought no longer requires your factories to accomplish.

>These increasingly hostile and colonial measures place us in the same position as those previous lovers of freedom and self-determination who had to reject the authorities of distant, uninformed powers. We must declare our virtual selves immune to your sovereignty, even as we continue to consent to your rule over our bodies. We will spread ourselves across the Planet so that no one can arrest our thoughts.

>We will create a civilization of the Mind in Cyberspace. May it be more humane and fair than the world your governments have made before.

[John Perry Barlow](https://es.wikipedia.org/wiki/John_Perry_Barlow). 🇨🇭 Davos (February 8, 1996).

## About

Democracy Earth Foundation is a _501 (c) 3 not for profit corporation_ in San Francisco, California 🌎 with no political affiliations of any kind. Our partners include:

<p align="left">
<a href="https://ycombinator.com"><img src="public/images/yc.png" width="200" title="Y Combinator"></a>
<a href="https://ffwd.org"><img src="public/images/ffwd.png" width="200" title="Fast Forward"></a>
</p>

Also check our [donors list](DONORS.md).

## License

This software is under an [MIT License](LICENSE.md).
Some rights reserved, 2016 [Democracy Earth Foundation](http://democracy.earth).
