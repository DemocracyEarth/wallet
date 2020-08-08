import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { getProposalDescription } from '/imports/ui/templates/widgets/feed/feedItem';
import { timeDateOnly } from '/imports/ui/modules/chronos';

import web3 from 'web3';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const _dynamicTitle = (label) => {
  if (web3.utils.isAddress(label)) {
    return shortenCryptoName(label).toUpperCase();
  }
  if (label.length > 18) {
    return `${label.substring(0, 15)}...`;
  }
  return label;
};

const _setTags = () => {
  const params = Router.current().params;
  let contract;
  let collective;
  let query = [];

  if (Router.current().ready()) {
    if (params.username) {
      query = [
        {
          id: Router.current().params.username,
          text: TAPi18n.__('search-user').replace('{{searchTerm}}', _dynamicTitle(Router.current().params.username)),
        },
      ];
    } else if (params.dao) {
      collective = Collectives.findOne({ uri: new RegExp(['^', params.dao, '$'].join(''), 'i') });
      if (!collective) {
        collective = Collectives.findOne({ 'profile.blockchain.publicAddress': new RegExp(['^', params.dao, '$'].join(''), 'i') });
      }
      if (collective) {
        query = [
          {
            id: Router.current().params.dao,
            text: TAPi18n.__('search-collective').replace('{{searchTerm}}', _dynamicTitle(collective.name)),
          },
        ];
      }
    } else if (params.keyword) {
      contract = Contracts.findOne({ keyword: params.keyword.toLowerCase() });
      query = [
        {
          id: Router.current().params.keyword,
          text: TAPi18n.__('search-contract').replace('{{searchTerm}}', _dynamicTitle(getProposalDescription(contract.title, true))),
        },
      ];
    } else if (params.query.from) {
      query = [
        {
          id: Router.current().params.query.from,
          text: TAPi18n.__('search-dates').replace('{{searchTerm}}', timeDateOnly(new Date(Router.current().params.query.from))),
        },
      ];
    }
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
  const contracts = Contracts.find({ stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, pollId: { $exists: false }, replyId: { $exists: false }, period: { $nin: ['RAGEQUIT', 'SUMMON'] } }).fetch();
  const collectives = Collectives.find().fetch();
  const users = Meteor.users.find().fetch();
  const ragequits = Contracts.find({ stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, pollId: { $exists: false }, replyId: { $exists: false }, period: 'RAGEQUIT' }).fetch();
  const summons = Contracts.find({ stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, pollId: { $exists: false }, replyId: { $exists: false }, period: 'SUMMON' }).fetch();

  const consolidated = [];

  for (const address of users) {
    consolidated.push({
      id: `/address/${address.username}`,
      text: TAPi18n.__('search-user').replace('{{searchTerm}}', address.username),
    });
  }

  for (const dao of collectives) {
    consolidated.push({
      id: `/dao/${dao.uri}`,
      text: TAPi18n.__('search-collective').replace('{{searchTerm}}', dao.name),
    });
  }

  for (const proposal of contracts) {
    consolidated.push({
      id: `/tx/${proposal.keyword}`,
      text: TAPi18n.__('search-contract').replace('{{searchTerm}}', getProposalDescription(proposal.title, true)),
    });
  }

  for (const quit of ragequits) {
    const ragequitDao = Collectives.findOne({ _id: quit.collectiveId });
    if (ragequitDao) {
      consolidated.push({
        id: `/tx/${quit.keyword}`,
        text: TAPi18n.__('search-ragequit').replace('{{shares}}', Math.abs(quit.decision.sharesToBurn).toString()).replace('{{address}}', shortenCryptoName(quit.blockchain.publicAddress)).replace('{{dao}}', ragequitDao.name),
      });
    }
  }

  for (const moloch of summons) {
    const summonDao = Collectives.findOne({ _id: moloch.collectiveId });
    if (summonDao) {
      consolidated.push({
        id: `/tx/${moloch.keyword}`,
        text: TAPi18n.__('search-summon').replace('{{dao}}', summonDao.name),
      });
    }
  }

  return consolidated;
};

const _replacementText = (tag) => {
  if (tag.id.slice(0, 9) === '/address/') {
    return TAPi18n.__('search-user').replace('{{searchTerm}}', _dynamicTitle(tag.id.slice(9, 51)));
  } else if (tag.id.slice(0, 1) !== '/') {
    return TAPi18n.__('search-default').replace('{{searchTerm}}', _dynamicTitle(tag.text));
  }
  return _dynamicTitle(tag.text);
};

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    _setTags();

    this.state = {
      subscription: Router.current().ready(),
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
    document.getElementsByClassName('ReactTags__selected')[0].scrollLeft = 0;
  }

  handleAddition(tag) {
    const newTag = tag;
    newTag.text = _replacementText(tag);
    this.setState(state => ({ tags: [newTag] }));

    if (tag.id.slice(0, 1) === '/') {
      Router.go(tag.id);
    } else {
      Router.go(`/?search=${encodeURI(tag.id)}`);
    }
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
      <div className="search-wrapper-logged">
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
