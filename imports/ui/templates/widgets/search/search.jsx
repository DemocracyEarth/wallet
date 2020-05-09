import React from 'react';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const _setTags = () => {
  const params = Router.current().params;
  let contract;
  let collective;
  let query = [];

  if (params.username) {
    query = [
      {
        id: Router.current().params.username,
        text: shortenCryptoName(Router.current().params.username),
      },
    ];
  } else if (params.dao) {
    collective = Collectives.findOne({ name: new RegExp(['^', params.dao, '$'].join(''), 'i') });
    if (collective) {
      query = [
        {
          id: Router.current().params.dao,
          text: collective.name,
        },
      ];
    }
  } else if (params.keyword) {
    contract = Contracts.findOne({ keyword: params.keyword });
    query = [
      {
        id: Router.current().params.keyword,
        text: contract.titile,
      },
    ];
  }

  Session.set('search', {
    input: '',
    query,
  });
};

const _getTags = () => {
  const search = Session.get('search');
  return search.query;
};

const _getSuggestions = () => {
  return [
    { id: 'USA', text: 'USA' },
    { id: 'Germany', text: 'Germany' },
    { id: 'Austria', text: 'Austria' },
    { id: 'Costa Rica', text: 'Costa Rica' },
    { id: 'Sri Lanka', text: 'Sri Lanka' },
    { id: 'Thailand', text: 'Thailand' },
  ];
};

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    _setTags();

    this.state = {
      tags: _getTags(),
      suggestions: _getSuggestions(),
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => { return (index !== i); }),
    });
  }

  handleAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  render() {
    const { tags, suggestions } = this.state;

    _setTags();

    this.state = {
      tags: _getTags(),
      suggestions: _getSuggestions(),
    };

    return (
      <div>
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          handleDelete={this.handleDelete}
          handleAddition={this.handleAddition}
          handleDrag={this.handleDrag}
          delimiters={delimiters}
          placeholder={TAPi18n.__('search-daos')}
        />
      </div>
    );
  }
}
