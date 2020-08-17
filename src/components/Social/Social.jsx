import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import 'styles/Dapp.css';

import { getDescription  } from 'components/Post/Post';
import tweet from 'images/tweet.png';

/**
* @summary displays the contents of a poll
*/
export default class Social extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tweetLink: `https://twitter.com/share?url=${escape(window.location.origin)}${escape(props.url)}&text=${escape(getDescription(props.description).title)}`,
    };
  }

  render() {
    return (
      <div className="post-footer">
        <div className="micro-menu">
          <a href={this.state.tweetLink} className="micro-button micro-button-feed no-underline" target="_blank" rel="noopener noreferrer">
            <img src={tweet} className="micro-icon" alt="" />
            <div className="micro-label-button">{i18n.t('tweet')}</div>
          </a>
        </div>
        {this.props.children}
      </div>
    );
  }
};

Social.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  url: PropTypes.string,
  description: PropTypes.string,
};
