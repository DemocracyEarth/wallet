import React from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
const Choice = (props) => {
  return (
    <div className="poll-choice">
      <div className="button half choice">
        <div className="checkbox-mini check-mini-unselected-box">
          <div className="checkmark_kick check-mini-unselected-mark" />
          <div className="checkmark_stem check-mini-unselected-mark" />
        </div>
        {props.label}
        <div className="micro-button micro-button-feed no-underline micro-button-poll" ontouchstart="">
          <div className="micro-label">
            {props.children}
          </div>
        </div>
        <div className="poll-score poll-score-button">
          <div className="poll-score-bar">
            <div className="poll-score-bar-fill" style={{ width: props.percentage }} />
          </div>
          <div className="poll-score-percentage">
            {props.percentage}
          </div>
        </div>
      </div>
    </div>
  );
};

Choice.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  percentage: PropTypes.string,
  label: PropTypes.string,
};

export default Choice;
