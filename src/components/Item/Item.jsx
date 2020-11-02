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
    icon: PropTypes.string,
    score: PropTypes.number,
    hideEmpty: PropTypes.bool,
    href: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }

  getLabel() {
    if (this.props.children) {
      return this.props.children;
    }
    return (this.props.label);
  }

  getTagStyle() {
    return `sidebar-tag ${(`${this.props.location.pathname}${this.props.location.search}` === this.props.href) ? 'sidebar-tag-selected' : null}`;
  }

  getLabelStyle() {
    if (this.props.children) {
      return `sidebar-label sidebar-label-${this.props.children.type.name.toLowerCase()}`;
    }
    return 'sidebar-label';
  }

  getIcon() {
    if (this.props.icon) {
      return this.props.icon;
    }
    console.log(this.props.location);
    return (`${this.props.location.pathname}${this.props.location.search}` === this.props.href) ? paperActive : paper;
  }

  render() {
    if (this.props.hideEmpty && this.props.score === 0) return null;
    return (
      <NavLink to={this.props.href} exact={true}
        isActive={(match, location) => { if (!match) { return false }; console.log(`${location.pathname}${location.search}`); console.log(this.props.href); return (`${location.pathname}${location.search}` === this.props.href); }} 
        className="menu-item" activeClassName="menu-item-selected"
      >
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
          {(this.props.score >= 100) ? '100+' : this.props.score}
        </div>
      </NavLink>
    );
  }
}

const Item = withRouter(ItemLink);
export { Item as default }
