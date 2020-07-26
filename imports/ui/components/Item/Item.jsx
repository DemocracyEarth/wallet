import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
const Item = (props) => {
  return (
    <div className="menu-item">
      <div className="sidebar-label">
        {props.label}
      </div>
      <div className="sidebar-tag">
        {props.score}
      </div>
    </div>
  );
};

Item.propTypes = {
  label: PropTypes.string,
  score: PropTypes.number,
};

export default Item;
