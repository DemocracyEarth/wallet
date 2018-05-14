import React, { Component } from 'react';
import styled from 'styled-components';

import Swiper from './partials/Swiper.jsx';

const OnboardingWrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
  position: relative;
  width: 100vw;
`;
const OnboardingSwiper = styled(Swiper)``;
const OnboardingActionbar = styled.div``;
const Slide = styled.div`
  align-content: center;
  align-items: flex-start;
  background: grey;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
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
        <OnboardingSwiper>
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
        </OnboardingSwiper>
        <OnboardingActionbar>Hello Footer</OnboardingActionbar>
      </OnboardingWrapper>
    );
  }
}

Onboarding.propTypes = {};
