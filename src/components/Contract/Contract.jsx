import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import conditions from 'images/conditions.svg';
import 'styles/Dapp.css';


/**
* @summary displays the contents of a poll
*/
const Contract = (props) => {
  if (props.hidden) {
    return null;
  }
  return (
    <div className="countdown">
      <div className="smart-contract">
        {props.children}
      </div>
    </div>
  );
};

Contract.propTypes = {
  hidden: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Contract;
