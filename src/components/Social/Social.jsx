import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import 'styles/Dapp.css';

import { getDescription  } from 'components/Post/Post';
import tweet from 'images/tweet.svg';
import tweetActive from 'images/tweet-active.svg';
import open from 'images/open.svg';
import openActive from 'images/open-active.svg';

/**
* @summary displays the contents of a poll
*/
export default class Social extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tweetLink: `https://twitter.com/share?url=${escape(window.location.origin)}${escape('/#')}${escape(props.url)}&text=${escape(getDescription(props.description).title)}`,
      tweetImg: tweet,
      openImg: open,
    };

    this.tweetToggle = this.tweetToggle.bind(this);
    this.openToggle = this.openToggle.bind(this);
  }

  tweetToggle() {
    if (this.state.tweetImg === tweet) {
      return this.setState({ tweetImg: tweetActive })
    }
    return this.setState({ tweetImg: tweet })
  }

  openToggle() {
    if (this.state.openImg === open) {
      return this.setState({ openImg: openActive })
    }
    return this.setState({ openImg: open })
  }

  render() {
    return (
      <div className="post-footer">
        <div className="micro-menu">
          <Link to={this.props.url} className="micro-button micro-button-feed no-underline" rel="noopener noreferrer"
            onMouseEnter={this.openToggle} onMouseLeave={this.openToggle}
          >
            <img src={this.state.openImg} className="micro-icon" alt="" />
            <div className="micro-label-button">{i18n.t('open-proposal')}</div>
          </Link>
        </div>
        <div className="micro-menu">
          <a href={this.state.tweetLink} className="micro-button micro-button-feed no-underline" target="_blank" rel="noopener noreferrer" 
            onClick={(e) => { e.stopPropagation(); }} onMouseEnter={this.tweetToggle} onMouseLeave={this.tweetToggle}
          >
            <img src={this.state.tweetImg} className="micro-icon" alt="" />
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
