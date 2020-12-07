import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown'
import i18n from 'i18n';
import { Link } from 'react-router-dom';

import Choice from 'components/Choice/Choice';
import Token from 'components/Token/Token';
import Countdown from 'components/Countdown/Countdown';
import Poll from 'components/Poll/Poll';
import Expand from 'components/Expand/Expand';

import arrowDown from 'images/arrow-down.svg';
import arrowDownActive from 'images/arrow-down-active.svg';
import arrowUpActive from 'images/arrow-up-active.svg';
import hand from 'images/hand.svg';
import handActive from 'images/hand-active.svg';
import link from 'images/link.svg';
import linkActive from 'images/link-active.svg';


import 'styles/Dapp.css';
const metadataParser = require('markdown-yaml-metadata-parser');

export default class Markdown extends Component {
  static propTypes = {
    link: PropTypes.string,
    collapsed: PropTypes.bool,
    daoAddress: PropTypes.string,
    description: PropTypes.string,
    accountAddress: PropTypes.string,
    votingPeriodBegins: PropTypes.string,
    votingPeriodEnds: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      collapsed: props.collapsed ? props.collapsed : true,
      img: (props.collapsed) ? arrowDownActive : arrowDown,
      hasPoll: false,
      options: [],
      openImg: link,
    };

    this.handleClick = this.handleClick.bind(this);
    this.openToggle = this.openToggle.bind(this);
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
    const hasPoll = (parsedContent.metadata && parsedContent.metadata.options);
    console.log(`hasPoll: ${hasPoll}`);
    console.log(hasPoll);
    this.setState({ text: parsedContent.content, metadata: parsedContent.metadata, hasPoll, options: Object.values(parsedContent.metadata.options) });
  }


  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ collapsed: !this.state.collapsed });
    if (!this.state.collapsed) { this.setState({ img: arrowDown }); } else { this.setState({ img: arrowUpActive }); };
  }

  openToggle() {
    if (this.state.openImg === link) {
      return this.setState({ openImg: linkActive })
    }
    return this.setState({ openImg: link })
  }

  render() {
    const timestamp = Math.floor(new Date().getTime() / 1000);

    const linkButton = (
      <Link to={this.props.link} target="_blank" className="micro-button micro-button-feed no-underline" rel="noopener noreferrer"
        onMouseEnter={this.openToggle} onMouseLeave={this.openToggle}
      >
        <img src={this.state.openImg} className="micro-icon" alt="" />
        <div className="micro-label-button">
          {i18n.t('markdown-open-proposal-link')}
        </div>
      </Link>
    )

    return (
      <>
        {(this.state.metadata && this.state.metadata.summary) ?
          <div className="title-input title-feed">
            {this.state.metadata.summary}
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
                  {linkButton}
                </div>
                :
                <div className="markdown-expander markdown-expanded" onClick={this.handleClick}>
                  {linkButton}
                </div>
              }
            </>
          :
          null
        }
        {
          (this.state.hasPoll) ?
            <Expand url={''} label={'0'} open={false}
              icon={hand} iconActive={handActive}
            >
              <Poll>
                <Countdown
                  now={timestamp}
                  votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodStarts}
                  gracePeriodEnds={this.props.votingPeriodEnds}
                />
                {this.state.options.map((option, index) => (
                  <Choice
                    now={timestamp}
                    accountAddress={this.props.accountAddress} daoAddress={this.props.daoAddress} description={this.props.description}
                    proposalIndex={index} label={option} percentage={'0%'}
                    voteValue={index} votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodStarts}
                    abi={'maker'}
                  >
                    <Token quantity={0} symbol="MKR" />
                  </Choice>
                ))}
              </Poll>
            </Expand>
            :
            null
        }
      </>
    );
  }
}
