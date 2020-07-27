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
 * @return string with css classes
 */
const _getMenuStyle = () => {
  if (Meteor.Device.isPhone()) {
    return 'sidebar sidebar-desktop';
  }
  return 'sidebar';
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
      <Item sharp label={`${TAPi18n.__('all-daos')}`} key={0} href="/" />
      <Item sharp label={`${TAPi18n.__('in-queue')}`} key={1} href="/?status=queue" />
      <Item sharp label={`${TAPi18n.__('voting-now')}`} key={2} href="/?status=voting" />
      <Item sharp label={`${TAPi18n.__('grace-period')}`} key={3} href="/?status=grace" />
      <Item sharp label={`${TAPi18n.__('ready-to-process')}`} key={4} href="/?status=ready" />
      <Item sharp label={`${TAPi18n.__('rejected')}`} key={5} href="/?status=rejected" />
      <Item sharp label={`${TAPi18n.__('approved')}`} key={6} href="/?status=approved" />
      <Item sharp label={`${TAPi18n.__('quits')}`} key={7} href="/?status=quits" />
      <Item sharp label={`${TAPi18n.__('jailed')}`} key={8} href="/?status=jailed" />
      <Item sharp label={`${TAPi18n.__('kicked')}`} key={9} href="/?status=kicked" />
    </div>
  );

  const daoList = data.members.map((item, key) => {
    return (
      <Item key={key} href={`/dao/${item.moloch.id}`}>
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

