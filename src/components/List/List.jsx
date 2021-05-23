import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { view as routerView } from 'lib/const'
import Item from 'components/Item/Item';

import back from 'images/back.svg';
import i18n from 'i18n';

import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class List extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
  }

  render() {
    return (
      <div id="sidebar" className="sidebar sidebar-desktop sidebar-up">
        <div className="menu">
          {(this.props.view === routerView.SEARCH) ?
            <div className="submenu">
              <Item sharp hideEmpty={false} icon={back} label={`${i18n.t('all-daos')}`} href={'/'} />
            </div>
            :
            null
          }
          <div className="separator">
            Vaults
          </div>
          <div className="submenu">
            <Item sharp label={`UBI DAI Vault`} score={'$ 60k'} key={0} href={'/'} />
          </div>
        </div>
      </div>
    );
  }
}
