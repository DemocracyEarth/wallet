import React from 'react';

import { shortenCryptoName } from 'utils/strings';
import { WithContext as ReactTags } from 'react-tag-input';
import PropTypes from 'prop-types';

import { findLast } from 'lodash';

import i18n from 'i18n';
import 'styles/Dapp.css';

const Web3 = require('web3');

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];
const suggestList = [];

/**
 * @summary inserts in the search cache an item
 * @param {sting} url that has the address of the item searched
 * @param {sring} text that represents the item
 */
const _includeInSearch = (url, text, kind) => {
  if (!findLast(suggestList, { id: url })) {
    suggestList.push({
      id: url,
      text: i18n.t(kind, { searchTerm: text }),
    });
  }
};

const _dynamicTitle = (label) => {
  const web3 = new Web3();
  if (web3.utils.isAddress(label)) {
    return shortenCryptoName(label).toUpperCase();
  }
  if (label.length > 18) {
    return `${label.substring(0, 15)}...`;
  }
  return label;
};

const _getTags = (contextTag) => {
  if (!contextTag) {
    return [];
  }
  return [contextTag];
};

const _replacementText = (tag) => {
  if (tag.id.slice(0, 9) === '/address/') {
    return i18n.t('search-user').replace('{{searchTerm}}', _dynamicTitle(tag.id.slice(9, 51)));
  } else if (tag.id.slice(0, 1) !== '/') {
    return i18n.t('search-default').replace('{{searchTerm}}', _dynamicTitle(tag.text));
  }
  return _dynamicTitle(tag.text);
};

export default class Search extends React.Component {
  static propTypes = {
    contextTag: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      subscription: true, // Router.current().ready(),
      tags: _getTags(props.contextTag),
      suggestions: suggestList,
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);

    console.log(`contextTag`);
    console.log(props.contextTag);
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
     // Router.go(tag.id);
    } else {
     // Router.go(`/?search=${encodeURI(tag.id)}`);
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

    return (
      <div className="search-wrapper-logged">
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          handleDelete={this.handleDelete}
          handleAddition={this.handleAddition}
          handleDrag={this.handleDrag}
          delimiters={delimiters}
          placeholder={i18n.t('search-daos')}
        />
      </div>
    );
  }
}

export const includeInSearch = _includeInSearch;
