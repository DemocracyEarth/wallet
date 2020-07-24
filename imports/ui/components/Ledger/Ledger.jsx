import React from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import Vote from '/imports/ui/components/Vote/Vote.jsx';

/**
* @summary displays the contents of a poll
*/
const Ledger = () => {
  return (
    <div>
      <div className="ledger-title">
        <h4>{TAPi18n.__('recent-activity')}</h4>
      </div>
      <Vote />
      <div className="ledger-footer" />
    </div>
  );
};

Ledger.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Ledger;
