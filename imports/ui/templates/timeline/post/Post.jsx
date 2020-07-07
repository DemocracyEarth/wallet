import React from 'react';
import PropTypes from 'prop-types';

export const Post = (props) => {
  return (
    <div id={props.id} className="vote vote-search vote-feed nondraggable vote-poll" href={`/dao/${props.daoName}/proposal/${props.proposalIndex}`}>
      {props.description}
    </div>
  );
};

Post.propTypes = {
  id: PropTypes.string,
  description: PropTypes.string,
  proposalIndex: PropTypes.string,
  daoName: PropTypes.string,
};
