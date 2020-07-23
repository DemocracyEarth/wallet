import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import { getTemplateImage } from '/imports/ui/templates/layout/templater.js';
import { getDescription  } from '/imports/ui/components/Post/Post.jsx';

/**
* @summary displays the contents of a poll
*/
export default class Social extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tweetIcon: '',
      tweetLink: `https://twitter.com/share?url=${escape(window.location.origin)}${escape(props.url)}&text=${escape(getDescription(props.description).title)}`,
    };
  }

  async componentDidMount() {
    await this.setIcons();
  }

  async setIcons() {
    this.setState({
      tweetIcon: await getTemplateImage('tweet'),
    });
  }

  render() {
    return (
      <div className="post-footer">
        <div className="micro-menu">
          <a href={this.state.tweetLink} className="micro-button micro-button-feed no-underline" target="_blank" rel="noopener noreferrer">
            <img src={this.state.tweetIcon} className="micro-icon" role="presentation" />
            <div className="micro-label-button">{TAPi18n.__('tweet')}</div>
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
