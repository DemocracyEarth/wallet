import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import { shortenCryptoName } from 'utils/strings';
import { defaults } from 'lib/const';
import Item from 'components/Item/Item.jsx';
import DAO from 'components/DAO/DAO.jsx';

import { reduce, sortBy } from 'lodash';
import i18n from 'i18n';
import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

export const GET_MEMBERSHIPS = gql`
  query membershipDetails($address: String) {
    members(where: { memberAddress: $address }) {
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

const defaultLabels = ['all', 'in-queue', 'voting-now', 'grace-period', 'ready-to-process', 'guild-kicks', 'rejected', 'approved'];

/**
 * @summary gets the default menu for the dapp
 * @param {boolean} atHome if its on the home location in the url
 */
const _getMenu = (atHome, data) => {
  const hideEmpty = !atHome;
  return (
    <div>
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[0])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[0])} key={0} href="/" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[1])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[1])} key={1} href="/?status=queue" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[2])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[2])} key={2} href="/?status=voting" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[3])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[3])} key={3} href="/?status=grace" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[4])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[4])} key={4} href="/?status=ready" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[5])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[5])} key={9} href="/?status=kicked" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[6])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[6])} key={5} href="/?status=rejected" />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[7])}`} score={(atHome) ? null : _getProposalCount(data.members, defaultLabels[7])} key={6} href="/?status=approved" />
    </div>
  );
};

/**
 * @summary the right style according to scroll move
 * @param {boolean} isUp if the scroll went up
 */
const _getScrollClass = (isUp) => {
  if (isUp) {
    return `sidebar sidebar-desktop sidebar-up`;
  }
  return `sidebar sidebar-desktop sidebar-down`;
};

/**
 * @summary based on a members data, count the types of proposals
 * @return {number} with final count
 */
const _getProposalCount = (list, label) => {
  const now = parseInt(new Date().getTime() / 1000, 10);
  const counter = [];

  reduce(list, (memo, num) => {
    if (label === 'all') {
      counter.push(num.submissions.length);
    }
    counter.push(
      reduce(num.submissions, (iterator, proposal) => {
        switch (label) {
          case 'in-queue':
            if (Number(proposal.votingPeriodStarts) > now) return parseInt(iterator + 1, 10);
            break;
          case 'voting-now':
            if ((Number(proposal.votingPeriodStarts) > now) && (Number(proposal.votingPeriodEnds) < now)) return parseInt(iterator + 1, 10);
            break;
          case 'grace-period':
            if (Number(proposal.votingPeriodEnds) > now && (Number(proposal.gracePeriodEnds) < now)) return parseInt(iterator + 1, 10);
            break;
          case 'ready-to-process':
            if ((Number(proposal.gracePeriodEnds) < now) && !proposal.processed) return parseInt(iterator + 1, 10);
            break;
          case 'rejected':
            if (Number(proposal.gracePeriodEnds) < now && !proposal.didPass) return parseInt(iterator + 1, 10);
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
  return reduce(counter, (memory, numerator) => { return parseInt(memory + numerator, 10); }, 0);
};

/**
* @summary displays corresponding separator headline
* @param {string} headline from TAPi18n dictionary
* @param {string} address to parse in title
* @return {string} with headline for separator
*/
const _getHeadline = (headline, address) => {
  // TODO: if (Router.current().url.replace(window.location.origin, '') === '/') {
  if (true) {
    return i18n.t(`${headline}-sidebar`);
  }
  return i18n.t(`${headline}-account`, { account: shortenCryptoName(address) });
};

/**
* @summary renders the menu based on a graph ql query ad hoc for the user
*/
const MenuQuery = ({ address, scrollUp }) => {
  const { loading, error, data } = useQuery(GET_MEMBERSHIPS, { variables: { address } });

  if (loading) {
    return (
      <div className="left">
        <div id="sidebar" className={_getScrollClass(scrollUp)}>
          <div className="menu">
            <div className="separator">
              {_getHeadline('proposals', address)}
            </div>
            {<div className="option-placeholder identity-placeholder" />}
          </div>
        </div>
      </div>

    );
  }
  if (error) return `Error! ${error}`;

  const atHome = true; // TODO: (Router.current().url.replace(window.location.origin, '') === '/');
  const defaultMenu = _getMenu(atHome, data);

  const sorted = sortBy(data.members, (item) => { return (item.submissions.length * -1); });
  const daoList = sorted.map((item, key) => {
    return (
      <Item key={key} href={`/dao/${item.moloch.id}`} score={item.submissions.length}>
        <DAO publicAddress={item.moloch.id} width="16px" height="16px" format="plainText" />
      </Item>
    );
  });

  const menuList = defaultMenu;

  return (
    <div id="sidebar" className={_getScrollClass(scrollUp)}>
      <div className="menu">
        <div className="separator">
          {_getHeadline('proposals', address)}
        </div>
        {menuList}
        <div className="separator">
          {_getHeadline('memberships', address)}
        </div>
        {(daoList.length > 0) ?
          daoList
          :
          <div className="empty">
            {i18n.t('no-memberships-found')}
          </div>
        }
      </div>
    </div>
  );
};

MenuQuery.propTypes = {
  address: PropTypes.string,
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
    if (this.props.address !== defaults.EMPTY) {
      return <MenuQuery address={this.props.address} scrollUp={this.state.scrollUp} />;
    }

    const atHome = true; // TODO:  (Router.current().url.replace(window.location.origin, '') === '/');
    const defaultMenu = _getMenu(atHome);

    return (
      <div id="sidebar" className={_getScrollClass(this.state.scrollUp)}>
        <div className="menu">
          <div className="separator">
            {_getHeadline('proposals', this.props.address)}
          </div>
          {defaultMenu}
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  address: PropTypes.string,
};
