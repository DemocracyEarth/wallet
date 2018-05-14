import { array, object, oneOfType, string } from 'prop-types';
import React, { Component } from 'react';
import Slick from 'react-slick';

import './slick.css';
import './slick-theme.css';

export default class Swiper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: 0,
      responsive: [],
    };
  }
  render() {
    const settings = {};
    return <Slick {...settings}>{this.props.children}</Slick>;
  }
}

Swiper.propTypes = {
  children: oneOfType([array, object, string]).isRequired,
};

Swiper.defaultProps = {};
