import React, { Component } from 'react';
import { Element } from 'react-scroll';
import { lory } from 'lory.js';

import ButtonRegular from '../../../general/components/ButtonRegular';
import ButtonArrow from '../../../general/components/ButtonArrow';
import SliderDots from '../../../general/components/SliderDots';

class AboutOutcomes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slider: null,
      sliderPrevIsVisible: false,
      sliderNextIsVisible: true,
      sliderDotsSelected: 0
    };

    this.outcomes = [
      {
        img : '',
        paragraph : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id posuere diam, accumsan.',
        url : ''
      },
      {
        img : '',
        paragraph : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id posuere diam, accumsan.',
        url : ''
      },
      {
        img : '',
        paragraph : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id posuere diam, accumsan.',
        url : ''
      },
      {
        img : '',
        paragraph : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id posuere diam, accumsan.',
        url : ''
      }
    ]
  }

  componentDidMount() {
    const slider = document.querySelector('.c-about-outcomes .js_slider');
    this.setState({
      slider: lory(slider, {
        enableMouseEvents: true,
        slideSpeed: 500
      })
    });

    slider.addEventListener('after.lory.slide', () => {
      this.checkButtonsVisibility();
      this.checkDots();
    });
    slider.addEventListener('on.lory.resize', () => {
      this.checkButtonsVisibility();
      this.checkDots();
    });
  }

  checkButtonsVisibility () {
    const currentIndex = this.state.slider.returnIndex();
    this.setState({ sliderPrevIsVisible: currentIndex !== 0 });
    this.setState({ sliderNextIsVisible: currentIndex !== this.outcomes.length - 2 });
  };

  checkDots () {
    const currentIndex = this.state.slider.returnIndex();
    this.setState({ sliderDotsSelected: currentIndex });
  };

  onClickPrevSlide = () => {
    this.state.slider.prev();
  };

  onClickNextSlide = () => {
    this.state.slider.next();
  };

  onClickDots = (e) => {
    this.state.slider.slideTo(parseInt(e.currentTarget.dataset.index));
  };

  render() {
    const slidePrevVisibilityClass = `c-about-outcomes__arrow-button -left ${!this.state.sliderPrevIsVisible ? '-hidden' : ''} js_slide_prev`;
    const slideNextVisibilityClass = `c-about-outcomes__arrow-button -right ${!this.state.sliderNextIsVisible ? '-hidden' : ''} js_slide_next`;

    return (
      <Element name="outcomes" className="c-about-outcomes">
        <div className="row">
          <div className="small-12 columns">
            <div className="c-about-outcomes__title text -title-xs -color-3">OUTCOMES AND TESTIMONIALS</div>
            <div className="slider js_slider">
              <div className="frame js_frame">
                <ul className="slides js_slides">
                  {this.outcomes.map((item, i) =>
                    <li key={i} className={`slide js_slide ${i === 0 ? 'active' : ''}`}>
                      <div className="c-about-outcomes-item">
                        <div className="c-about-outcomes-item__image"></div>
                        <div className="c-about-outcomes-item__paragraph text -paragraph -color-2">{item.paragraph}</div>
                        <div className="c-about-outcomes-item__button">
                          <ButtonRegular text="READ MORE" color="green" url={item.url} />
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
                <div className={slidePrevVisibilityClass} onClick={this.onClickPrevSlide}>
                  <ButtonArrow orientation="left" />
                </div>
                <div className={slideNextVisibilityClass} onClick={this.onClickNextSlide}>
                  <ButtonArrow orientation="right" />
                </div>
              </div>
              <div className="c-about-outcomes__slider-dots js_slider_dots">
                <SliderDots
                  count={this.outcomes.length}
                  selected={this.state.sliderDotsSelected}
                  color="green"
                  callback={this.onClickDots.bind(this)} />
              </div>
            </div>
          </div>
        </div>
      </Element>
    );
  }
}

export default AboutOutcomes;
