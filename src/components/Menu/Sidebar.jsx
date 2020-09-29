import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import Item from 'components/Item/Item';
import DAO from 'components/DAO/DAO';

import { reduce, sortBy } from 'lodash';
import { view as routerView } from 'lib/const'

import i18n from 'i18n';
import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

const MENU_DATA = `
  id
  memberAddress
  moloch {
    id
    title
  }
  id
  didPass
  guildkick
  gracePeriodEnds
  votingPeriodStarts
  votingPeriodEnds
  sponsor
  processed
  applicant
`

const GET_MEMBERSHIPS = gql`
  query membershipDetails($address: String) {
    proposals(where: { proposer: $address }) {
      ${MENU_DATA}
    }
  }
`;

const GET_DAOS = gql`
  query membershipDetails($address: String) {
    proposals(where: { molochAddress: $address }) {
      ${MENU_DATA}
    }
  }
`;

const GET_PROPOSAL_DAO = gql`
  query membershipDetails($proposalId: String) {
    proposals(where: { id: $proposalId }) {
      ${MENU_DATA}
    }
  }
`;


/**
 * @summary gets the default menu for the dapp
 * @param {string} view from router
 * @param {object} data from graph
 * @param {string} address in view
 */
const _getMenu = (view, data, address) => {
  const atHome = (view === routerView.HOME);
  const hideEmpty = !atHome
  const defaultLabels = ['all', 'in-queue', 'voting-now', 'grace-period', 'ready-to-process', 'rejected', 'approved'];

  let baseRoute;

  switch (view) {
    case routerView.DAO:
      baseRoute = `/dao/${address}`;
      break;
    default:
      baseRoute = `/address/${address}`;
  }

  return (
    <div>
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[0])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[0])} key={0} href={(atHome) ? `/` : baseRoute } />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[1])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[1])} key={1} href={(atHome) ? '/period/queue' : `${baseRoute}/period/queue`} />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[2])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[2])} key={2} href={(atHome) ? '/period/voting' : `${baseRoute}/period/voting`} />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[3])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[3])} key={3} href={(atHome) ? '/period/grace' : `${baseRoute}/period/grace`} />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[4])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[4])} key={4} href={(atHome) ? '/period/ready' : `${baseRoute}/period/ready`} />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[5])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[5])} key={5} href={(atHome) ? '/period/rejected' : `${baseRoute}/period/rejected`} />
      <Item sharp hideEmpty={hideEmpty} label={`${i18n.t(defaultLabels[6])}`} score={(atHome) ? null : _getProposalCount(data.proposals, defaultLabels[6])} key={6} href={(atHome) ? '/period/approved' : `${baseRoute}/period/approved`} />
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

  counter.push(reduce(list, (iterator, proposal) => {
    switch (label) {
      case 'all':
        return list.length;
      case 'in-queue':
        if (Number(proposal.votingPeriodStarts) >= now) return parseInt(iterator + 1, 10);
        break;
      case 'voting-now':
        if ((Number(proposal.votingPeriodStarts) <= now) && (Number(proposal.votingPeriodEnds) >= now)) return parseInt(iterator + 1, 10);
        break;
      case 'grace-period':
        if (Number(proposal.votingPeriodEnds) < now && (Number(proposal.gracePeriodEnds) > now)) return parseInt(iterator + 1, 10);
        break;
      case 'ready-to-process':
        if ((Number(proposal.gracePeriodEnds) < now) && !proposal.processed && proposal.sponsored) return parseInt(iterator + 1, 10);
        break;
      case 'rejected':
        if (proposal.processed && !proposal.didPass) return parseInt(iterator + 1, 10);
        break;
      case 'approved':
        if (proposal.processed && proposal.didPass) return parseInt(iterator + 1, 10);
        break;
      default:
    }
    return iterator;
  }, 0));
  return reduce(counter, (memory, numerator) => { return parseInt(memory + numerator, 10); }, 0);
};

/**
* @summary displays corresponding separator headline
* @param {string} headline from i18n dictionary
* @param {string} address to parse in title
* @param {string} view context of router
* @return {string} with headline for separator
*/
const _getHeadline = (headline, address, view) => {
  switch (view) {
    case routerView.HOME:
    case routerView.PERIOD:
      return i18n.t(`${headline}-sidebar`);
    case routerView.DAO:
      return i18n.t(`${headline}-account-dao`);
    case routerView.PROPOSAL:
      return i18n.t(`${headline}-account-proposal`);
    default:
      return i18n.t(`${headline}-account`);
  }
};


/**
* @summary checks if for a given ad hoc sidebar menu there are proposals
* @param {string} view currently based on router
* @param {array} menuList with configured menu for this view
* @return {boolean} if at least one menu item has content
*/
const _checkContent = (view, menuList) => {
  if (view === routerView.ADDRESS || view === routerView.DAO) {
    for (let menuItem of menuList.props.children) {
      if (menuItem.props.score > 0) {
        return true;
      }
    }
  } else {
    return true;
  }
  return false;
}

/**
* @summary gets the uniq daos obtained from the query of a given address
* @param {object} data with graphql
* @return {array} with sorted results
*/
const _getDAOs = (data) => {
  const listedDAOs = [];
  let found = false;
  for (let item of data.proposals) {
    found = false;
    for (let dao of listedDAOs) {
      if (item.moloch.id === dao.id) {
        dao.counter += 1;
        found = true;
      }
    }
    if (!found) {
      listedDAOs.push({
        id: item.moloch.id,
        title: item.moloch.title,
        counter: 1
      })
    }
  }
  return sortBy(listedDAOs, (item) => { return (item.counter * -1) });
}


/**
 * @summary retrieves the corresponding query for the timeline.
 * @param {string} view based on router context
 */
const composeQuery = (view) => {
  switch (view) {
    case routerView.DAO:
      return GET_DAOS;
    case routerView.PROPOSAL:
      return GET_PROPOSAL_DAO;
    default:
      return GET_MEMBERSHIPS;
  }
}

/**
* @summary renders the menu based on a graph ql query ad hoc for the user
*/
const MenuQuery = ({ address, scrollUp, view, proposalId }) => {
  const { loading, error, data } = useQuery(composeQuery(view), { variables: { address, proposalId } });

  if (loading) {
    return (
      <div className="left">
        <div id="sidebar" className={_getScrollClass(scrollUp)}>
          <div className="menu">
            <div className="separator">
              {_getHeadline('proposals', address, view)}
            </div>
            {<div className="option-placeholder identity-placeholder" />}
          </div>
        </div>
      </div>
    );
  }
  if (error) return `Error! ${error}`;

  const defaultMenu = _getMenu(view, data, address);

  const sorted = _getDAOs(data);
  const daoList = sorted.map((item, key) => {
    return (
      <Item key={key} href={`/dao/${item.id}`} score={item.counter}>
        <DAO publicAddress={item.id} width="16px" height="16px" format="plainText" />
      </Item>
    );
  });

  const menuList = defaultMenu;
  const hasContent = _checkContent(view, menuList);
  
  const daoMemberships = (
    <div>
      <div className="separator">
        {_getHeadline('memberships', address, view)}
      </div>
      {
      (daoList.length > 0) ?
      daoList
      :
      <div className="empty">
        {i18n.t('no-memberships-found')}
      </div>
      }
    </div>
  );

  const proposalMenu = (
    <div>
      <div className="separator">
        {_getHeadline('proposals', address, view)}
      </div>
      {(hasContent) ?
        menuList
        :
        <div className="empty">
          {i18n.t('no-proposals-found')}
        </div>
      }
    </div>
  );

  return (
    <div id="sidebar" className={_getScrollClass(scrollUp)}>
      <div className="menu">
        {(view !== routerView.PROPOSAL) ?
          proposalMenu
          :
          null
        }
        {(view === routerView.ADDRESS || view === routerView.PROPOSAL) ?
          daoMemberships 
          :
          null 
        }
      </div>
    </div>
  );
};

MenuQuery.propTypes = {
  address: PropTypes.string,
  scrollUp: PropTypes.bool,
  view: PropTypes.string,
  proposalId: PropTypes.string,
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

    if ((st > lastScrollTop) && (st > 60) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  render() {
    if ((this.props.view !== routerView.HOME) && (this.props.view !== routerView.PERIOD)) {
      return <MenuQuery address={this.props.address} scrollUp={this.state.scrollUp} view={this.props.view} proposalId={this.props.proposalId} />;
    }

    const defaultMenu = _getMenu(routerView.HOME);

    return (
      <div id="sidebar" className={_getScrollClass(this.state.scrollUp)}>
        <div className="menu">
          <div className="separator">
            {_getHeadline('proposals', this.props.address, this.props.view)}
          </div>
          {defaultMenu}
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  address: PropTypes.string,
  view: PropTypes.string,
  proposalId: PropTypes.string,
};
