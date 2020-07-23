import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
const Survey = (props) => {
  return (
    <div className="poll-survey">
      {props.children}
    </div>
  );
};

Survey.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Survey;
