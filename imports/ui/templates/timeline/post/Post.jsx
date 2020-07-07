import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { wrapURLs } from '/lib/utils';

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
* @summary gets the description from a moloch proposal
* @param {string} title with xml
* @return {string} with html
*/
const _parse = (description, onlyTitle) => {
  let html = '';
  if (isJSON(description)) {
    const json = JSON.parse(description);
    if (json && json.title !== undefined) {
      const finalText = wrapURLs(description, true);
      html += `<div class='title-header'>${json.title}</div><div class='title-description'>${finalText}</div>`;
      if (onlyTitle) { return json.title; }
    }
    if (json && json.link !== undefined && json.link !== json.description) {
      html += `<div class='title-description'><a href='${json.link}' target='_blank'>${json.link}</a></div>`;
    }
    return html;
  }
  return description;
};

`
<div class='title-header'>MGP 24: Year of DAOs: Moloch Rises</div>
<div class='title-description'>
{"title":"MGP 24: Year of DAOs: Moloch Rises","description":"Year of DAOs: Moloch Rises event funding: <a href="https://paper.dropbox.com/doc/Year-of-the-DAOs-Moloch-Rises-Proposal--AlCLmVQ2G7VlkjaDBOjqP8Z8Ag-v14NgCTkABbuTKBBcYDcg"}" target="_blank">https://paper.dropbox.com/doc/Year-of-the-DAOs-Moloch-Rises-Proposal--AlCLmVQ2G7VlkjaDBOjqP8Z8Ag-v14NgCTkABbuTKBBcYDcg"} </a></div>

`

export default class Post extends Component {
  constructor(props) {
    super(props);

    console.log(props);
    console.log(`isJSON(props.description): ${_isJSON(props.description)}`);

    if (_isJSON(props.description)) {
      const json = JSON.parse(props.description);

      console.log(json);

      this.state = {
        title: json.title ? json.title : '',
        description: json.description ? json.description : json,
        link: json.link ? json.link : undefined,
      };
    } else {
      this.state = {
        title: undefined,
        description: props.description,
        link: undefined,
      };
    }

    console.log(this.state);
  }

  render() {
    return (
      <div id={this.props.id} className="vote vote-search vote-feed nondraggable vote-poll" href={`/dao/${this.props.daoName}/proposal/${this.props.proposalIndex}`}>
        <div className="title-header">
          {this.state.title}
        </div>
        <div className="title-description">
          {this.state.description}
        </div>
        {
          this.state.link ?
            <div className="title-description">
              <a href={this.state.link} target="_blank" rel="noopener noreferrer">{this.state.link}</a>
            </div>
            :
            null
        }
      </div>
    );
  }
}

Post.propTypes = {
  id: PropTypes.string,
  description: PropTypes.string,
  proposalIndex: PropTypes.string,
  daoName: PropTypes.string,
};
