import React, { Component } from 'react';
import styled from 'styled-components';

import { Action, Actionbar } from '../../../styled/components/';
import { color, font, setHeight, setSpace, setType, track } from '../../../styled/utils/';

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
  ${setSpace('pth')};
  left: 0;
  position: fixed;
  right: 0;
  text-align: center;
  top: 0;
  z-index: 5;
`;
const Logo = styled.img`
  ${setHeight('h')};
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
  ${setSpace('phm')};
  ${setSpace('pvl')};
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
  justify-content: flex-end;
  &:before {
    background: linear-gradient(rgba(51, 38, 61, 0.2) 0, rgba(51, 38, 61, 0.4) 60%, ${color.eggplantM}) 100%;
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
const SlideBd = styled.div`
  ${setSpace('pvl')};
  color: ${color.white};
  margin-left: auto;
  margin-right: auto;
  max-width: 360px;
  position: relative;
  text-align: center;
  width: 100%;
  z-index: 3;
`;
const SlideTitle = styled.h1`
  ${setType('l')};
  ${setSpace('mbm')};
  color: ${color.white};
  font-family: ${font.mont};
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: ${track.m};
`;
const SlideText = styled.p`
  ${setType('l')};
  color: ${color.white};
  font-family: ${font.lato};
`;

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <OnboardingWrapper>
        <OnboardingHd>
          <Logo src="images/democracy-earth-inverted.png" alt="Democracy Earth" />
        </OnboardingHd>
        <OnboardingBd>
          <OnboardingSwiper>
            <div>
              <Slide backg="images/onboarding-vote.png">
                <SlideBd>
                  <SlideTitle>Vote</SlideTitle>
                  <SlideText>Participate in ballots of interest. Vote anonymously. Create your own ballots.</SlideText>
                </SlideBd>
              </Slide>
            </div>
            <div>
              <Slide backg="images/onboarding-delegate.png">
                <SlideBd>
                  <SlideTitle>Delegate</SlideTitle>
                  <SlideText>Lend your voting power to a representative. Get it back anytime.</SlideText>
                </SlideBd>
              </Slide>
            </div>
            <div>
              <Slide backg="images/onboarding-beinformed.png">
                <SlideBd>
                  <SlideTitle>Be informed</SlideTitle>
                  <SlideText>Stay up to date with all of the ballots that concern you. Witness a tranparent democracy.</SlideText>
                </SlideBd>
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
