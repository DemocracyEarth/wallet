import { array, object, oneOfType, string } from 'prop-types';
import React, { Component } from 'react';
import Slick from 'react-slick';

import '../../../../css/slick.css';
import '../../../../css/slick-theme.css';

export default class Swiper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const settings = {
      adaptiveHeight: false,
      arrows: false,
      autoplaySpeed: 5000,
      autoplay: true,
      dots: true,
      infinite: true,
      initialSlide: 0,
      slidesToScroll: 1,
      slidesToShow: 1,
      speed: 1000,
    };
    return <Slick {...settings}>{this.props.children}</Slick>;
  }
}

Swiper.propTypes = {
  children: oneOfType([array, object, string]).isRequired,
};

Swiper.defaultProps = {};
