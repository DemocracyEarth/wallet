import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
import { TAPi18n } from 'meteor/tap:i18n';
import PropTypes from 'prop-types';
import { setupWeb3, getWeb3Wallet } from '/imports/startup/both/modules/metamask';

import Item from '/imports/ui/components/Item/Item.jsx';
import DAO from '/imports/ui/components/DAO/DAO.jsx';

const numeral = require('numeral');

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

const GET_MENU = `
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
 * @summary style based on type of device
 * @return {string} with css classes
 */
const _getMenuStyle = () => {
  if (Meteor.Device.isPhone()) {
    return 'sidebar sidebar-desktop';
  }
  return 'sidebar';
};

/**
 * @summary based on a members data, count the types of proposals
 * @return {number} with final count
 */
const _getProposalCount = (list, label) => {
  const now = parseInt(new Date().getTime() / 1000, 10);
  const counts = [];

  _.reduce(list, (memo, num) => {
    if (label === 'all') {
      console.log(`parseInt(num.submissions.length + memo, 10);: ${parseInt(num.submissions.length + memo, 10)}`);
      counts.push(num.submissions.length);
    }
    counts.push(
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
  return _.reduce(counts, (memory, numerator) => { return parseInt(memory + numerator, 10); }, 0);
};

/**
* @summary displays the contents of a poll
*/
const MenuQuery = ({ account }) => {
  const { loading, error, data } = useQuery(gql(GET_MENU.replace('{{memberAddress}}', '0x865c2f85c9fea1c6ac7f53de07554d68cb92ed88')));

  if (loading) {
    return (
      <div />
    );
  }
  if (error) return `Error! ${error}`;

  console.log(data);

  const menuList = (
    <div>
      <Item sharp hideEmpty label={`${TAPi18n.__('all')}`} score={_getProposalCount(data.members, 'all')} key={0} href="/" />
      <Item sharp hideEmpty label={`${TAPi18n.__('in-queue')}`} score={_getProposalCount(data.members, 'in-queue')} key={1} href="/?status=queue" />
      <Item sharp hideEmpty label={`${TAPi18n.__('voting-now')}`} score={_getProposalCount(data.members, 'voting-now')} key={2} href="/?status=voting" />
      <Item sharp hideEmpty label={`${TAPi18n.__('grace-period')}`} score={_getProposalCount(data.members, 'grace-period')} key={3} href="/?status=grace" />
      <Item sharp hideEmpty label={`${TAPi18n.__('ready-to-process')}`} score={_getProposalCount(data.members, 'ready-to-process')} key={4} href="/?status=ready" />
      <Item sharp hideEmpty label={`${TAPi18n.__('guild-kicks')}`} score={_getProposalCount(data.members, 'guild-kicks')} key={9} href="/?status=kicked" />
      <Item sharp hideEmpty label={`${TAPi18n.__('rejected')}`} score={_getProposalCount(data.members, 'rejected')} key={5} href="/?status=rejected" />
      <Item sharp hideEmpty label={`${TAPi18n.__('approved')}`} score={_getProposalCount(data.members, 'approved')} key={6} href="/?status=approved" />
    </div>
  );

  const sorted = _.sortBy(data.members, (item) => { return (item.submissions.length * -1); });

  const daoList = sorted.map((item, key) => {
    return (
      <Item key={key} href={`/dao/${item.moloch.id}`} score={item.submissions.length}>
        <DAO publicAddress={item.moloch.id} width="16px" height="16px" format="plainText" />
      </Item>
    );
  });

  return (
    <div className="left">
      <div className={_getMenuStyle()}>
        <div className="menu">
          <div className="separator">
            {TAPi18n.__('proposals')}
          </div>
          {menuList}
          <div className="separator">
            {TAPi18n.__('memberships')}
          </div>
          {daoList}
        </div>
      </div>
    </div>
  );
};

MenuQuery.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  account: PropTypes.string,
};

/**
* @summary renders a post in the timeline
*/
export default class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: ['0x0'],
    };
  }

  async componentDidMount() {
    await this.getAccounts();
  }

  async getAccounts() {
    const web3 = getWeb3Wallet();
    const accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      this.setState({ accounts });
    }
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <MenuQuery account={this.state.accounts[0]} />
      </ApolloProvider>
    );
  }
}

Menu.propTypes = MenuQuery.propTypes;

