import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown'
import i18n from 'i18n';
import Expand from 'components/Expand/Expand';
import ethereum from 'images/ethereum.svg';
import ethereumActive from 'images/ethereum-active.svg';
import arrowDown from 'images/arrow-down.svg';
import arrowDownActive from 'images/arrow-down-active.svg';
import arrowUpActive from 'images/arrow-up-active.svg';

import 'styles/Dapp.css';
const metadataParser = require('markdown-yaml-metadata-parser');

export default class Markdown extends Component {
  static propTypes = {
    link: PropTypes.string,
    collapsed: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      collapsed: props.collapsed ? props.collapsed : true,
      img: (props.collapsed) ? arrowDownActive : arrowDown,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.props.link) this.getMarkdown();
  }

  getMarkdown() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', this.props.link, false);
    xmlHttp.send(null);
    console.log(xmlHttp.responseText);
    let parsedContent = metadataParser(xmlHttp.responseText);
    console.log(parsedContent);
    this.setState({ text: parsedContent.content, metadata: parsedContent.metadata });
  }


  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ collapsed: !this.state.collapsed });
    if (!this.state.collapsed) { this.setState({ img: arrowDown }); } else { this.setState({ img: arrowUpActive }); };
  }


  render() {
    return (
      <>
        {(this.state.metadata && this.state.metadata.summary) ?
          <div className="title-input title-feed">
            <div className="title-header">
              {this.state.metadata.summary}
            </div>
          </div>
          :
          null
        }
        {
          (this.state.text) ?
            <>
              <ReactMarkdown className={(this.state.collapsed) ? "markdown collapsed" : "markdown expanded"} children={this.state.text} />
              {(this.state.collapsed) ?
                <div className="markdown-expander" onClick={this.handleClick}>
                  <div className="read-more">
                    {i18n.t('markdown-read-full-article')}
                    <img className="details-icon details-icon-markdown" alt="" src={this.state.img} />
                  </div>
                </div>
                :
                <div className="markdown-expander markdown-expanded" onClick={this.handleClick}>
                  <div className="read-more read-more-expanded">
                    {i18n.t('markdown-collapse-article')}
                    <img className="details-icon details-icon-markdown" alt="" src={this.state.img} />
                  </div>
                </div>
              }
            </>
          :
          null
        }
      </>
    );
  }
}
