import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import { wrapURLs } from '/lib/utils';

import Account from '/imports/ui/templates/timeline/account/Account.jsx';

/**
* @summary quick function to determine if a string is a JSON
* @param {string} str ing
*/
const _isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

/**
* @summary renders a post in the timeline
*/
export default class Post extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDescription();
  }

  getDescription() {
    // content formatting
    let content;
    if (_isJSON(this.props.description)) {
      const json = JSON.parse(this.props.description);

      content = {
        title: json.title ? json.title : json,
        description: json.description ? wrapURLs(json.description) : '',
        link: (typeof json.link === 'function' || !json.link) ? '' : json.link,
      };
    } else {
      content = {
        title: wrapURLs(this.props.description),
        description: null,
        link: null,
      };
    }
    return content;
  }

  render() {
    return (
      <div className="vote vote-search vote-feed nondraggable vote-poll" href={`/dao/${this.props.daoName}/proposal/${this.props.proposalIndex}`}>
        <div className="checkbox checkbox-custom">
          <div className="meta meta-search meta-bar">
            <Account id={`avatar-${this.props.memberAddress}`} publicAddress={this.props.memberAddress} width="24px" height="24px" />
          </div>
          <div className="option-proposal">
            <div className="option-title option-link option-search title-input">
              <div className="title-input title-feed">
                <div className="title-header">
                  {typeof this.state.title === 'string' ? parser(this.state.title) : this.state.title}
                </div>
                {
                  (this.state.description) ?
                    <div className="title-description">
                      {typeof this.state.description === 'string' ? parser(this.state.description) : this.state.description}
                    </div>
                    :
                    null
                }
                {
                  (this.state.link) ?
                    <div className="title-description">
                      <a href={this.state.link} target="_blank" rel="noopener noreferrer">{this.state.link}</a>
                    </div>
                    :
                    null
                }
              </div>
            </div>
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  description: PropTypes.string,
  proposalIndex: PropTypes.string,
  daoName: PropTypes.string,
  memberAddress: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
