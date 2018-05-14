import React, { Component } from 'react';
import styled from 'styled-components';

import Swiper from './partials/Swiper.jsx';

const OnboardingWrapper = styled.div`
  background: white;
  height: 100vh;
  width: 100vw;
`;
const Slide = styled.div``;
const SlideHd = styled.div`
  background: yellow;
`;
const SlideBd = styled.div`
  background: magenta;
`;
const SlideFt = styled.div`
  background: cyan;
`;

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <OnboardingWrapper>
        <h1>Hello world</h1>
        <Swiper>
          <Slide>
            <SlideHd>SlideHd</SlideHd>
            <SlideBd>SlideBd</SlideBd>
            <SlideFt>SlideBd</SlideFt>
          </Slide>
          <Slide>
            <SlideHd>SlideHd</SlideHd>
            <SlideBd>SlideBd</SlideBd>
            <SlideFt>SlideBd</SlideFt>
          </Slide>
        </Swiper>
      </OnboardingWrapper>
    );
  }
}

Onboarding.propTypes = {};
