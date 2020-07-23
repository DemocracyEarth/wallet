import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
const Placeholder = () => {
  return (
    <div id="feedItem-placeholder" className="vote vote-search vote-feed nondraggable">
      <div className="checkbox checkbox-custom">
        <div className="meta meta-search meta-bar">
          <div className="identity">
            <div className="avatar-editor">
              <div className="identity-peer">
                <div className="option-placeholder identity-placeholder" />
              </div>
            </div>
          </div>
          <div className="dao">
            <div className="avatar-editor">
              <div className="identity-peer">
                <div className="option-placeholder identity-placeholder" />
              </div>
            </div>
          </div>
        </div>
        <div className="option-proposal">
          <div className="option-title option-link option-search title-input">
            <div className="title-input title-feed">
              <div className="option-placeholder" />
              <div className="option-placeholder" />
              <div className="option-placeholder fifty" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Placeholder.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Placeholder;
