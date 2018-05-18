import React, { Component } from 'react';
import styled from 'styled-components';

import { Action, Actionbar, Container, Separator } from '../../../styled/components/';
import { color, font, radius, setHeight, setSpace, setType, track } from '../../../styled/utils/';

import EmailLogin from '../../components/identity/login/EmailLogin.jsx';
import Signup from '../../components/identity/signup/Signup.jsx';

import DetailsModal from './partials/DetailsModal.jsx';
import Swiper from './partials/Swiper.jsx';

const OnboardingWrapper = styled.div`
  background: ${color.eggplantM};
  height: 100vh;
  width: 100vw;
`;
const OnboardingHd = styled.div`
  ${setSpace('pam')};
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
  .slick-dots {
    ${setSpace('mbl')};
    ${setSpace('pbm')};
    bottom: 70px;
    left: 0;
    position: absolute;
    right: 0;
    li {
      ${setSpace('man')};
      height: auto;
      line-height: 0;
      width: auto;
    }
    li button {
      &:before {
        background: ${color.flareLLt};
        border-radius: ${radius.a};
        display: inline-block;
        height: 6px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
      }
    }
    li.slick-active button:before {
      background: ${color.white};
      width: 12px;
    }
  }
`;
const OnboardingFt = styled.div`
  ${setSpace('phm')};
  ${setSpace('pvl')};
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
`;
const OnboardingSwiper = styled(Swiper)``;
const Slide = styled.div`
  ${setSpace('phm')};
  ${setSpace('pth')};
  padding-bottom: 120px;
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
const FormHolder = styled(Container)`
  ${setSpace('mth')};
  margin-left: auto;
  margin-right: auto;
  max-width: 360px;
`;

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 'default',
      detailsModal: false,
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleView = this.toggleView.bind(this);
  }
  toggleModal(modal) {
    this.setState({ [modal]: !this.state[modal] });
  }
  toggleView(view) {
    this.setState({ currentView: view });
  }
  render() {
    const { currentView, detailsModal } = this.state;
    const getCurrentView = () => {
      if (currentView === 'default') {
        return [
          <OnboardingHd key="hd">
            <Actionbar satellite="right">
              <Action
                iconic
                inverted
                onClick={() => {
                  return this.toggleModal('detailsModal');
                }}
                secondary
              >
                ?
              </Action>
            </Actionbar>
            <Separator size="s" silent />
            <Logo src="images/democracy-earth-inverted.png" alt="Democracy Earth" />
          </OnboardingHd>,
          <OnboardingBd key="bd">
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
                <Action
                  fixed
                  secondary
                  inverted
                  onClick={() => {
                    return this.toggleView('login');
                  }}
                >
                  Log in
                </Action>
                <Action
                  fixed
                  primary
                  inverted
                  onClick={() => {
                    return this.toggleView('signup');
                  }}
                >
                  Sign up
                </Action>
              </Actionbar>
            </OnboardingFt>
          </OnboardingBd>,
        ];
      } else if (currentView === 'login') {
        return (
          <OnboardingHd>
            <Actionbar satellite="both">
              <Action
                iconic
                inverted
                onClick={() => {
                  return this.toggleView('default');
                }}
                secondary
              >
                ←
              </Action>
              <Action
                iconic
                inverted
                onClick={() => {
                  return this.toggleModal('detailsModal');
                }}
                secondary
              >
                ?
              </Action>
            </Actionbar>
            <Separator size="s" silent />
            <Logo src="images/democracy-earth-inverted.png" alt="Democracy Earth" />
            <FormHolder>
              <EmailLogin />
            </FormHolder>
          </OnboardingHd>
        );
      } else if (currentView === 'signup') {
        return (
          <OnboardingWrapper>
            <OnboardingHd>
              <Actionbar satellite="both">
                <Action
                  secondary
                  inverted
                  iconic
                  onClick={() => {
                    return this.toggleView('default');
                  }}
                >
                  ←
                </Action>
                <Action
                  iconic
                  inverted
                  onClick={() => {
                    return this.toggleModal('detailsModal');
                  }}
                  secondary
                >
                  ?
                </Action>
              </Actionbar>
              <Separator size="s" silent />
              <Logo src="images/democracy-earth-inverted.png" alt="Democracy Earth" />
              <FormHolder>
                <Signup />
              </FormHolder>
            </OnboardingHd>
          </OnboardingWrapper>
        );
      }
      return null;
    };
    return (
      <OnboardingWrapper key="wrapper">
        {getCurrentView()}
        {detailsModal ? (
          <DetailsModal
            isOpen={this.state.detailsModal}
            key="modal"
            onClose={() => {
              return this.toggleModal('detailsModal');
            }}
          />
        ) : null}
      </OnboardingWrapper>
    );
  }
}

Onboarding.propTypes = {};
