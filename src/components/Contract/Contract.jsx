import React from 'react';
import PropTypes from 'prop-types';
import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Contract = (props) => {
  return (
    <div className="smart-contract">
      {props.children}
    </div>
  );
};

Contract.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Contract;
