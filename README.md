![DemocracyEarth](https://dl.dropboxusercontent.com/u/801018/democracy-earth-logo.png)

# Incorruptible governance for small and large communities

## A Toolkit for Democracy

A **vote** is the fundamental currency of political action. Yet, unlike the financial instruments used for trade like the US dollar or Bitcoin, no standardized technology exists to account for a signal that helps settle ideological disputes of a wide variety of organizations that depend on voting. From the board of directors of a modern corporation, an open source software development roadmap or the whole of society that composes an entire Nation-State require voting technology that each stakeholder can trust. **The more reliable, decentralized and standard voting is, the greater trust the community that defines preferences, rights and power to its members can guarantee.**

This is an open source toolkit that lets anyone design voting mechanisms in a simple way using the [Bitcoin Blockchain](http://bitcoin.it) to store proof. This means anyone can count votes **without requiring permission** from the authority serving this software. And no programming skills are required from the users in order to design voting rules that can be applied to any kind of organization. We hope to *democratize democracy*.  

## Democracy
Direct Democracy, Liquid Democracy, Representative Democracy... Democracy period. If you trace back the origins of the term 'agora', as it was used by the Greeks to speak of the technology used for democratic decision-making, you'll find that the etymological meaning is 'thinking with others'. In many verses of The Odyssey and The Illiad it's used as an antonym of 'war'. Democracy is always a work in progress. It's a incomplete idea because it's the one exception to all ideologies. If it were an absolute ideology it would be a totalitarian idea just like all the other ideologies out there. In the age of Software, democracy can be programmed. But the ultimate programmer, should always be the voter itself.

Democracy Earth aims to provide the necessary tools for anyone to  create its own kind of democracy. Interface, modeling and code merge at a core symbolic level.

## Live at [democracy.earth](http://democracy.earth)

## [Contributing](CONTRIBUTING.md)

## [License](LICENSE.md)

## Components
What differentiates voting from mere surveys or polls are a couple of key elements: proper identity validation (elections need to avoid fraud), institutional commitment to accept the outcome (binding results), and a legitimate understanding of the content being voted by all parties.

The toolkit consists of votable objects that can be combined to create all sorts of institutional mechanisms. These objects consist of four elements usually found in every form of contract: Identifications (who is the authority for the contents expressed), Definitions (what the contents expressed mean), Decisions (the outcome of the contents if approved) and Companies (abstract organizations liable to the goals of the expressed contents).

* Identifications are found at **[/peer](http://democracy.earth)**: credentials of individuals whose approval for voting rights is based on reviews from other peers, guaranteeing decentralized authority.
* Decisions are found at **[/vote](http://democracy.earth)**: laws, bills or norms with customizable ballot design, voting rules and member scope.
* Definitions are found at  **[/tag](http://democracy.earth)**: semantic layer of concepts that can be used to disambiguate ideas and also serves as a proxy for delegation of voting rights between peers (a.k.a. [liquid democracy](https://en.wikipedia.org/wiki/Delegative_democracy)).
* Collectives are found at **[/collective](http://democracy.earth)**: corporations or peer organizations constituted under rules built by this software, hence guaranteeing binding results.

All of these, *peers*, *votes*, *tags* and *collective*, are votable and results get hashed on the Bitcoin Blockchain. **This develops an open network of political relations that contribute to the foundations of purely digital institutional design and governance.**

* Any **peer** can **vote** in **collective** (s)he belongs to.
* Every **collective** has **peers**.
<!-- > **Tags** are approved with **votes**. -->
* **peers** vote on **proposals**
* **Votes** are described with **tags**.
* **Votes** can be of different types : binary (support/reject), multiple choice (users can add ideas) and executive options.
* **Peers** delegate voting rights using **tags**.

## Data structures
In order to populate the data base we recommend using the command ``meteor mongo`` that allows you to send directly json files to the database. You can also access the database through meteor admin panel located on http://localhost:3000/admin.

All data schemas used by the platform are located in the  **[/collections folder](https://github.com/DemocracyEarth/earth/tree/master/collections)**

Every political function : voting, delegating, starting up a collective, is a simple contract in .json which you can find in **[/collections folder](https://github.com/DemocracyEarth/earth/tree/master/collections)**

* Proposals = contract.js
* Delegations = votes.js
* Collectives = collectives.js

## Technical specs + deploy instructions
The app is built on **[Meteor](https://www.meteor.com/)** version 1.3.4
The reasons behind that technical choice are :
> rapid deployment of app across all platforms (web, native, iOS/Android).
> Easy structure of code.

## In order to deploy the Democracy Earth app you follow those steps :

### Install Meteor
```curl https://install.meteor.com/ | sh
```
Should install at the same time MongoDB and Node.js.

### Clone App
### Locate terminal on the right folder
### Deploy earth app
Just type the following command, your app will be deployed on http://localhost:3000/
```meteor --settings=config/development/settings.json
```




``// version 0.01, codename San Francisco.``
