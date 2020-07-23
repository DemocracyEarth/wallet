import React from 'react';
import PropTypes from 'prop-types';

import { getDescription  } from '/imports/ui/components/Post/Post.jsx';

/**
* @summary displays the contents of a poll
*/
const Preview = (props) => {
  const title = getDescription(props.description).title;
  const previewLabel = (title.length > 15) ? `${title.slice(0, 14)}...` : title;

  return (
    <div className="date-info">
      <a href={props.uintVote} className="verifier verifier-live verifier-feed">
        {previewLabel}
      </a>
    </div>
  );
};

Preview.propTypes = {
  uintVote: PropTypes.number,
  description: PropTypes.string,
};

export default Preview;
