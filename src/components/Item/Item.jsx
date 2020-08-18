import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import paperActive from 'images/paper-active.svg';
import paper from 'images/paper.svg';
import 'styles/Dapp.css';

/**
* @summary checks if href matches to current url
* @param {string} url with href to match
* @return {boolean}
*/
const _matchingContext = (url) => {
  if (url) {
    const current = '/'; // Router.current().url.replace(window.location.origin, '');
    /* if ((Router.current().params.username === url.substring(6))
      || (current === url)
    )*/ 
    if (current === url.substring(6)) {
      return true;
    }
  }
  return false;
};


/**
* @summary displays the contents of a poll
*/
export default class Item extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inContext: _matchingContext(this.props.href),
    };
  }

  getLabel() {
    if (this.props.children) {
      return this.props.children;
    }
    return (this.props.label);
  }

  getStyle() {
    return `menu-item ${this.state.inContext ? 'menu-item-selected' : null}`;
  }

  getTagStyle() {
    return `sidebar-tag ${this.state.inContext ? 'sidebar-tag-selected' : null}`;
  }

  getIcon() {
    return (this.state.inContext) ? paperActive : paper;
  }

  getLabelStyle() {
    if (this.props.children) {
      return `sidebar-label sidebar-label-${this.props.children.type.name.toLowerCase()}`;
    }
    return 'sidebar-label';
  }

  render() {
    if (this.props.hideEmpty && this.props.score === 0) return null;
    return (
      <Link to={this.props.href} className="menu-item" activeClassName="menu-item-selected">
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
      </Link>
    );
  }
}

Item.propTypes = {
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

