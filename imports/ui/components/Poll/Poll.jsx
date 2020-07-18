import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
const Poll = (props) => {
  return (
    <div className="section section-poll">
      <div className="poll">
        {props.children}
      </div>
    </div>
  );
};

Poll.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Poll;
