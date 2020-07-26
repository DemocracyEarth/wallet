import { Meteor } from 'meteor/meteor';
import React from 'react';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
import { TAPi18n } from 'meteor/tap:i18n';
import PropTypes from 'prop-types';

import Item from '/imports/ui/components/Item/Item.jsx';

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
const MenuQuery = () => {
  const user = Meteor.user().username || '0x0';
  const { loading, error, data } = useQuery(gql(GET_MENU.replace('{{memberAddress}}', user)));

  if (loading) {
    return (
      <div />
    );
  }
  if (error) return `Error! ${error}`;

  console.log(data);

  return (
    <div className="left">
      <div className={_getMenuStyle()}>
        <div className="menu">
          <div className="separator">
            {TAPi18n.__('overview')}
          </div>
          <div className="separator">
            {TAPi18n.__('memberships')}
          </div>
          <Item label="Moloch DAO" score={20} />
          <div className="separator">
            {TAPi18n.__('periods')}
          </div>
          <div className="separator">
            {TAPi18n.__('proposals')}
          </div>
        </div>
      </div>
      <div className="menu menu-empty menu-footer">
        {/* replicator */}
      </div>
    </div>
  );
};

MenuQuery.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

/**
* @summary renders a post in the timeline
*/
const Menu = () => {
  return (
    <ApolloProvider client={client}>
      <MenuQuery />
    </ApolloProvider>
  );
};

Menu.propTypes = MenuQuery.propTypes;

export default Menu;
