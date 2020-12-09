import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown'
import i18n from 'i18n';
import reduce from 'lodash';

import Choice from 'components/Choice/Choice';
import Token from 'components/Token/Token';
import Countdown from 'components/Countdown/Countdown';
import Poll from 'components/Poll/Poll';
import Survey from 'components/Poll/Survey';
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

export default class MakerDAO extends Component {
  static propTypes = {
    href: PropTypes.string,
    link: PropTypes.string,
    collapsed: PropTypes.bool,
    daoAddress: PropTypes.string,
    description: PropTypes.string,
    accountAddress: PropTypes.string,
    votingPeriodBegins: PropTypes.string,
    votingPeriodEnds: PropTypes.string,
    voteCount: PropTypes.string,
    voteHistory: PropTypes.arrayOf(PropTypes.object),
    timeLine: PropTypes.arrayOf(PropTypes.object),
  }

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      collapsed: props.collapsed ? props.collapsed : true,
      img: (props.collapsed) ? arrowDownActive : arrowDown,
      hasPoll: false,
      tally: [],
      openImg: link,
      label: '',
    };

    console.log(props.voteHistory);

    this.handleClick = this.handleClick.bind(this);
    this.openToggle = this.openToggle.bind(this);
  }

  componentDidMount() {
    if (this.props.link) this.getMarkdown();
  }

  tally(options) {
    const final = options;
    console.log(`options:`);
    console.log(options);
    console.log(`this.props.voteHistory:`);
    console.log(this.props.voteHistory);
    console.log(`this.props.timeLine:`);
    console.log(this.props.timeLine);

    const keys = Object.keys(options);
    const tally = [];

    for (const key of keys) {
      tally.push({
        voters: 0,
        label: options[key],
        optionId: key,
        percentage: 0
      })
    }
  
    let found;
    for (const vote of this.props.voteHistory) {
      if (options[vote.option] && vote.__typename === 'PollVote') {
        found = false;
        for (const choice of tally) {
          if (choice.label === options[vote.option]) {
            choice.voters ++;
            found = true;
            break;
          }
        }
        if (!found) {
          tally.push({
            voters: 1,
            label: options[vote.option],
            optionId: vote.option,
            percentage: 0
          })
        }
      }
    }

    // percentages
    let totalPercentage = 0;
    for (const score of tally) {
      if (score.voters) totalPercentage += parseInt(Number(score.voters), 10); 
    }
    for (const item of tally) {
      console.log(item.voters);
      if (totalPercentage > 0) {
        item.percentage = parseFloat((item.voters * 100) / totalPercentage, 10).toString();
      } else {
        item.percentage = '0';
      }
    }
    
    console.log(`tally:`);
    console.log(tally);

    console.log('-----');
    return tally; //  Object.values(final);
  }

  getMarkdown() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', this.props.link, false);
    xmlHttp.send(null);
    let parsedContent = metadataParser(xmlHttp.responseText);
    const hasPoll = (parsedContent.metadata && parsedContent.metadata.options);
    console.log(`parsedContent:`);
    console.log(parsedContent);
    this.setState({ text: parsedContent.content, metadata: parsedContent.metadata, 
      hasPoll, tally: this.tally(parsedContent.metadata.options),
      label: (Number(this.props.voteCount) > 0) ? i18n.t('see-proposal-maker-count', { totalVoters: this.props.voteCount, voterLabel: parsedContent.metadata.vote_type }) : i18n.t('no-voters'),
    });
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
      <>
        <a href={(this.state.metadata && this.state.metadata.discussion_link) ? this.state.metadata.discussion_link : ''} target="_blank" rel="noopener noreferrer" className="micro-button micro-button-feed no-underline"
          onMouseEnter={this.openToggle} onMouseLeave={this.openToggle}
        >
          <img src={this.state.openImg} className="micro-icon" alt="" />
          <div className="micro-label-button">
            {i18n.t('markdown-open-discussion-link')}
          </div>
        </a>
        <a href={this.props.link} target="_blank" rel="noopener noreferrer" className="micro-button micro-button-feed no-underline"
          onMouseEnter={this.openToggle} onMouseLeave={this.openToggle}
        >
          <img src={this.state.openImg} className="micro-icon" alt="" />
          <div className="micro-label-button">
            {i18n.t('markdown-open-proposal-link')}
          </div>
        </a>
      </>
    )

    console.log(`this.props.voteCount: ${this.props.voteCount}`);

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
              <div className="markdown-expander">
                {linkButton}
              </div>
            </>
          :
          null
        }
        {
          (this.state.hasPoll) ?
            <Expand url={this.props.href} label={this.state.label} open={false}
              icon={hand} iconActive={handActive}
            >
              <Poll>
                <Countdown
                  now={timestamp}
                  votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodStarts}
                  gracePeriodEnds={this.props.votingPeriodEnds}
                />
                <Survey>
                  {this.state.tally.map((option, index) => (
                    <Choice
                      now={timestamp} key={index}
                      accountAddress={this.props.accountAddress} daoAddress={this.props.daoAddress} description={this.props.description}
                      proposalIndex={index.toString()} label={option.label} percentage={option.percentage}
                      voteValue={option.voters} votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodStarts}
                      abi={'maker'}
                    >
                      <Token quantity={'0'} symbol="MKR" />
                    </Choice>
                  ))}
                </Survey>
              </Poll>
            </Expand>
            :
            null
        }
      </>
    );
  }
}
