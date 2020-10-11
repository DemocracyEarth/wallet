import React from 'react';
import PropTypes from 'prop-types';

import Tab from 'components/TabMenu/Tab';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const TabMenu = (props) => {
  return (
    <>
      <div class="tab-menu">
        {
          props.tabs.map((item, key) => {
            return (
              <Tab label={item.label} action={item.action} selected={item.selected} />
            );
          })
        }
      </div>
    </>
  );
};

TabMenu.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    selected: PropTypes.bool,
  })).isRequired,
};

export default TabMenu;

