import React from 'react';
import PropTypes from 'prop-types';

import Vote from '/imports/ui/components/Vote/Vote.jsx';

/**
* @summary displays the contents of a poll
*/
const Ledger = () => {
  return (
    <div>
      <div className="ledger-title">
        <h4>Recent events.</h4>
      </div>
      <Vote />
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
