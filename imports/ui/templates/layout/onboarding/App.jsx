import React, { Component } from 'react';
import styled from 'styled-components';

import { Action, Actionbar } from '../../../styled/components/';
import { color, setSpace } from '../../../styled/utils/';

// import BEINFORMED from './assets/onboarding-beinformed.jpg';
// import DELEGATE from './images/onboarding-delegate.jpg';
// import VOTE from './images/onboarding-vote.jpeg';

import Swiper from './partials/Swiper.jsx';

const OnboardingWrapper = styled.div`
  background: ${color.eggplantM};
  height: 100vh;
  width: 100vw;
`;
const OnboardingHd = styled.div`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 5;
`;
const OnboardingBd = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
  width: 100vw;
  .slick-slider {
    flex: 1 1 100%;
    position: relative;
  }
  .slick-list,
  .slick-track,
  .slick-slide,
  .slick-slide > div,
  .slick-slide > div > div {
    height: 100%;
  }
`;
const OnboardingFt = styled.div`
  ${setSpace('phm')};
  ${setSpace('pvl')};
  flex: 1 1 auto;
`;
const OnboardingSwiper = styled(Swiper)``;
const Slide = styled.div`
  align-content: center;
  align-items: flex-start;
  background-color: ${color.eggplantM};
  background-image: ${({ backg }) => {
    return `url(${backg})`;
  }};
  background-position: center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  &:before {
    background: linear-gradient(rgba(51, 38, 61, 0) 0, rgba(51, 38, 61, 0.35) 60%, ${color.eggplantM}) 100%;
    bottom: 0;
    content: ' ';
    height: 100%;
    left: 0;
    opacity: 0.35;
    position: absolute;
    right: 0;
    top: 0;
  }
`;
const SlideHd = styled.div`
  background: yellow;
  position: relative;
  z-index: 3;
`;
const SlideBd = styled.div`
  background: magenta;
  position: relative;
  z-index: 3;
`;
const SlideFt = styled.div`
  background: cyan;
  position: relative;
  z-index: 3;
`;

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <OnboardingWrapper>
        <OnboardingHd>Head</OnboardingHd>
        <OnboardingBd>
          <OnboardingSwiper>
            <div>
              <Slide backg="images/onboarding-vote.png">
                <SlideHd>SlideHd</SlideHd>
                <SlideBd>SlideBd</SlideBd>
                <SlideFt>SlideBd</SlideFt>
              </Slide>
            </div>
            <div>
              <Slide backg="images/onboarding-delegate.png">
                <SlideHd>SlideHd</SlideHd>
                <SlideBd>SlideBd</SlideBd>
                <SlideFt>SlideBd</SlideFt>
              </Slide>
            </div>
            <div>
              <Slide backg="images/onboarding-beinformed.png">
                <SlideHd>SlideHd</SlideHd>
                <SlideBd>SlideBd</SlideBd>
                <SlideFt>SlideBd</SlideFt>
              </Slide>
            </div>
          </OnboardingSwiper>
          <OnboardingFt>
            <Actionbar>
              <Action fixed secondary inverted>
                Log in
              </Action>
              <Action fixed primary inverted>
                Sign up
              </Action>
            </Actionbar>
          </OnboardingFt>
        </OnboardingBd>
      </OnboardingWrapper>
    );
  }
}

Onboarding.propTypes = {};
