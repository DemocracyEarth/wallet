import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'meteor/iron:router';

import { getTemplateImage } from '/imports/ui/templates/layout/templater.js';

/**
* @summary checks if href matches to current url
* @param {string} url with href to match
* @return {boolean}
*/
const _matchingContext = (url) => {
  if (url) {
    const current = Router.current().url.replace(window.location.origin, '');
    if ((Router.current().params.username === url.substring(6))
      || (current === url)
    ) {
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
      icon: {
        paper: '',
        paperActive: '',
      },
    };
  }

  async componentDidMount() {
    await this.setIcons();
  }

  async setIcons() {
    this.setState({
      icon: {
        paper: await getTemplateImage('paper'),
        paperActive: await getTemplateImage('paper-active'),
      },
    });
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
    return (this.state.inContext) ? this.state.icon.paperActive : this.state.icon.paper;
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
      <a className={this.getStyle()} href={this.props.href}>
        {(this.props.sharp) ?
          <div className="sidebar-sharp">
            <img src={this.getIcon()} role="presentation" className="menu-item-icon" />
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
      </a>
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

