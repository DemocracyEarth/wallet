import React from 'react';
import PropTypes from 'prop-types';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Tab = (props) => {
  return (
    <h4 id='tab-button' className={`tab-button ${props.selected ? 'tab-button-selected' : null}`} onClick={props.action}>
      {props.label}
    </h4>
  );
};

Tab.propTypes = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  action: PropTypes.func,
};

export default Tab;

