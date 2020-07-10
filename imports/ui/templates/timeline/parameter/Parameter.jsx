import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the timestamp of a given post or event
*/
const Parameter = (props) => {
  return (
    <div className="parameter">
      <div className="parameter-name">
        {props.label}
      </div>
      <div className="parameter-value">
        {props.children}
      </div>
    </div>
  );
};

Parameter.propTypes = {
  label: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Parameter;
