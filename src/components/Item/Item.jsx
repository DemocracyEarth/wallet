import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, NavLink } from 'react-router-dom';

import paperActive from 'images/paper-active.svg';
import paper from 'images/paper.svg';
import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
class ItemLink extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    sharp: PropTypes.bool,
    label: PropTypes.string,
    score: PropTypes.number,
    hideEmpty: PropTypes.bool,
    href: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  getLabel() {
    if (this.props.children) {
      return this.props.children;
    }
    return (this.props.label);
  }

  getTagStyle() {
    return `sidebar-tag ${(this.props.location.pathname === this.props.href) ? 'sidebar-tag-selected' : null}`;
  }

  getLabelStyle() {
    if (this.props.children) {
      return `sidebar-label sidebar-label-${this.props.children.type.name.toLowerCase()}`;
    }
    return 'sidebar-label';
  }

  getIcon() {
    return (this.props.location.pathname === this.props.href) ? paperActive : paper;
  }

  render() {
    if (this.props.hideEmpty && this.props.score === 0) return null;
    return (
      <NavLink to={this.props.href} className="menu-item" activeClassName="menu-item-selected">
        {(this.props.sharp) ?
          <div className="sidebar-sharp">
            <img src={this.getIcon()} alt="" className="menu-item-icon" />
          </div>
          :
          null
        }
        <div className={this.getLabelStyle()}>
          {this.getLabel()}
        </div>
        <div className={this.getTagStyle()}>
          {this.props.score}
        </div>
      </NavLink>
    );
  }
}

const Item = withRouter(ItemLink);
export { Item as default }
