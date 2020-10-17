import React, { Component } from 'react';
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import PropTypes from 'prop-types';

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  margin: 0 auto;
  border-color: var(--menu-sidebar-selected);
  display: inline-block;
`;

const _getViewport = () => {
  if (window.innerWidth <= 991) {
    return document.getElementById('content');
  }
  return document.getElementById('dapp');
}

export default class Paginator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  static propTypes = {
    page: PropTypes.number,
    placeholder: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }

  componentDidMount() {
    if (document.getElementById('content') && document.getElementById('dapp')) {
      const viewport = _getViewport();
      viewport.addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUnmount() {
    if (document.getElementById('content') && document.getElementById('dapp')) {
      const viewport = _getViewport();
      viewport.removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll() {
    var element = document.getElementById(`paginator-${this.props.page}`);

    if (typeof (element) !== 'undefined' && element !== null) {
      const top = element.getBoundingClientRect().top;
      const innerHeight = window.innerHeight;

      if (top < innerHeight) {
        this.setState({ visible: true });
      }
    }
  }

  render() {
    return (
      <div>
        {(!this.state.visible || this.props.placeholder) ? 
          <div id={`paginator-${this.props.page}`} className="spinner-loading">
            <BeatLoader
              css={override}
              size={15}
              margin={2}
              color={'var(--menu-sidebar-selected)'}
              loading={this.state.loading}
            />
          </div>
          :
          this.props.children
        }
    </div>
    );
  }
}
