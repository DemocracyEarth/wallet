import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Session } from 'meteor/session';
import { addTag } from '/lib/data';
import { convertToSlug } from '../../../../../utils/functions';


export default class Tag extends Component {
  addTagClick(tagId) {
    addTag(tagId, parseInt(Session.get('dbTagList').length) + 1)
  }

  render() {
    const { suggestion, text, label, url, id } = this.props;
    const content = suggestion ? text : label;
    return (
      <div className="tag-label">
        <img src="/images/hashtag.png" className="hash-icon"/>
        <a href={ url } className="w-clearfix w-inline-block hash-link">
          <div className="hash-tag">{ content }</div>
        </a>
        { suggestion &&
          <div id={`add-suggested-tag-${convertToSlug(content)}`} className="action" onClick={() => this.addTagClick(id)}>
            <div>
              <strong>＋</strong>
            </div>
          </div>
        }
      </div>
    );
  }
}
