import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Router } from 'meteor/iron:router';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { TAPi18n } from 'meteor/tap:i18n';
import PropTypes from 'prop-types';
import { shortenCryptoName } from '/imports/startup/both/modules/metamask';
import { defaults } from '/lib/const.js';

import Item from '/imports/ui/components/Item/Item.jsx';
import DAO from '/imports/ui/components/DAO/DAO.jsx';

// scroll settings
let lastScrollTop = 0;

export const GET_MEMBERSHIPS = `
{
  members(where: { memberAddress: "{{memberAddress}}" }) {
    id
    memberAddress
     moloch {
      id
      title
    }
    tokenTribute
    exists
    shares
    didRagequit
    submissions {
      id
      didPass
      guildkick
      gracePeriodEnds
      votingPeriodStarts
      votingPeriodEnds
      sponsor
      processed
    }
    kicked
    jailed {
      id
    }
    proposedToKick
  }
}
`;

/**
 * @summary gets the default menu for the dapp
 * @param {boolean} atHome if its on the home location in the url
 */
const _getMenu = (atHome) => {
  const defaultLabels = ['all', 'in-queue', 'voting-now', 'grace-period', 'ready-to-process', 'guild-kicks', 'rejected', 'approved'];
  const hideEmpty = !atHome;
  return (
    <div>
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[0])}`} score={null} key={0} href="/" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[1])}`} score={null} key={1} href="/?status=queue" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[2])}`} score={null} key={2} href="/?status=voting" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[3])}`} score={null} key={3} href="/?status=grace" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[4])}`} score={null} key={4} href="/?status=ready" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[5])}`} score={null} key={9} href="/?status=kicked" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[6])}`} score={null} key={5} href="/?status=rejected" />
      <Item sharp hideEmpty={hideEmpty} label={`${TAPi18n.__(defaultLabels[7])}`} score={null} key={6} href="/?status=approved" />
    </div>
  );
};

/**
 * @summary the right style according to scroll move
 * @param {boolean} isUp if the scroll went up
 */
const _getScrollClass = (isUp) => {
  if (isUp) {
    return `sidebar ${!Meteor.Device.isPhone() ? 'sidebar-desktop' : null} sidebar-up`;
  }
  return `sidebar ${!Meteor.Device.isPhone() ? 'sidebar-desktop' : null} sidebar-down`;
};

/**
 * @summary based on a members data, count the types of proposals
 * @return {number} with final count
 */
const _getProposalCount = (list, label) => {
  const now = parseInt(new Date().getTime() / 1000, 10);
  const counter = [];

  _.reduce(list, (memo, num) => {
    if (label === 'all') {
      counter.push(num.submissions.length);
    }
    counter.push(
      _.reduce(num.submissions, (iterator, proposal) => {
        switch (label) {
          case 'in-queue':
            if (proposal.votingPeriodStarts.toNumber() > now) return parseInt(iterator + 1, 10);
            break;
          case 'voting-now':
            if ((proposal.votingPeriodStarts.toNumber() > now) && (proposal.votingPeriodEnds.toNumber() < now)) return parseInt(iterator + 1, 10);
            break;
          case 'grace-period':
            if (proposal.votingPeriodEnds.toNumber() > now && (proposal.gracePeriodEnds.toNumber() < now)) return parseInt(iterator + 1, 10);
            break;
          case 'ready-to-process':
            if ((proposal.gracePeriodEnds.toNumber() < now) && !proposal.processed) return parseInt(iterator + 1, 10);
            break;
          case 'rejected':
            if (proposal.gracePeriodEnds.toNumber() < now && !proposal.didPass) return parseInt(iterator + 1, 10);
            break;
          case 'approved':
            if (proposal.didPass) return parseInt(iterator + 1, 10);
            break;
          case 'sponsored':
            if (proposal.sponsor) return parseInt(iterator + 1, 10);
            break;
          case 'kicked':
            if (proposal.guildKick) return parseInt(iterator + 1, 10);
            break;
          default:
        }
        return iterator;
      }, 0)
    );
  }, 0);
  return _.reduce(counter, (memory, numerator) => { return parseInt(memory + numerator, 10); }, 0);
};

/**
* @summary displays corresponding separator headline
* @param {string} headline from TAPi18n dictionary
* @param {string} account to parse in title
* @return {string} with headline for separator
*/
const _getHeadline = (headline, account) => {
  if (Router.current().url.replace(window.location.origin, '') === '/') {
    return TAPi18n.__(`${headline}-sidebar`);
  }
  return TAPi18n.__(`${headline}-account`).replace('{{account}}', shortenCryptoName(account));
};

/**
* @summary renders the menu based on a graph ql query ad hoc for the user
*/
const MenuQuery = ({ account, scrollUp }) => {
  const { loading, error, data } = useQuery(gql(GET_MEMBERSHIPS.replace('{{memberAddress}}', account)));

  if (loading) {
    return (
      <div className="left">
        <div id="sidebar" className={_getScrollClass(scrollUp)}>
          <div className="menu">
            <div className="separator">
              {_getHeadline('proposals', account)}
            </div>
            {<div className="option-placeholder identity-placeholder" />}
          </div>
        </div>
      </div>

    );
  }
  if (error) return `Error! ${error}`;

  console.log(data);

  const atHome = (Router.current().url.replace(window.location.origin, '') === '/');
  const defaultMenu = _getMenu(atHome);

  const sorted = _.sortBy(data.members, (item) => { return (item.submissions.length * -1); });
  const daoList = sorted.map((item, key) => {
    return (
      <Item key={key} href={`/dao/${item.moloch.id}`} score={item.submissions.length}>
        <DAO publicAddress={item.moloch.id} width="16px" height="16px" format="plainText" />
      </Item>
    );
  });

  let i = 0;
  for (const defaultItem of defaultMenu.props.children) {
    defaultItem.props.score = (atHome) ? null : _getProposalCount(data.members, defaultLabels[i]);
    i += 1;
  }
  const menuList = defaultMenu;

  return (
    <div id="sidebar" className={_getScrollClass(scrollUp)}>
      <div className="menu">
        <div className="separator">
          {_getHeadline('proposals', account)}
        </div>
        {menuList}
        <div className="separator">
          {_getHeadline('memberships', account)}
        </div>
        {(daoList.length > 0) ?
          daoList
          :
          <div className="empty">
            {TAPi18n.__('no-memberships-found')}
          </div>
        }
      </div>
    </div>
  );
};

MenuQuery.propTypes = {
  account: PropTypes.string,
  scrollUp: PropTypes.bool,
};

/**
* @summary displays the contents of a poll
*/
export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      node: document.getElementById('sidebar'),
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }


  async componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if ((st > lastScrollTop) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  render() {
    if (this.props.account !== defaults.EMPTY) {
      return <MenuQuery account={this.props.account} scrollUp={this.state.scrollUp} />;
    }

    const atHome = (Router.current().url.replace(window.location.origin, '') === '/');
    const defaultMenu = _getMenu(atHome);

    return (
      <div id="sidebar" className={_getScrollClass(this.state.scrollUp)}>
        <div className="menu">
          <div className="separator">
            {_getHeadline('proposals', this.props.account)}
          </div>
          {defaultMenu}
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  account: PropTypes.string,
};
