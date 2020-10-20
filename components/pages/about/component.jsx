import React from 'react';
import Link from 'next/link';

import { Button } from 'gfw-components';

import Cover from 'components/cover';
import SubnavMenu from 'components/subnav-menu';
import Icon from 'components/ui/icon';

import Projects from 'components/pages/about/section-projects';
import How from 'components/pages/about/section-how';
import Impacts from 'components/pages/about/section-impacts';
import HistorySection from 'components/pages/about/section-history';
import Contact from 'components/pages/about/section-contact';
import Partners from 'components/pages/about/section-partners';
import Join from 'components/pages/about/section-join';

import mailIcon from 'assets/icons/mail.svg?sprite';
import bgImage from './header-bg.jpg';

import './styles.scss';

const sections = {
  how: {
    label: 'GFW in Action',
    anchor: 'gfw-in-action',
    component: 'how',
  },
  impacts: {
    label: 'Impacts',
    anchor: 'impacts',
    component: 'impacts',
  },
  history: {
    label: 'History',
    anchor: 'history',
    component: 'history',
  },
  contact: {
    label: 'Contact Us',
    anchor: 'contact',
    component: 'contact',
  },
  partners: {
    label: 'Partnership',
    anchor: 'partnership',
    component: 'partners',
  },
};

const sectionComponents = {
  history: HistorySection,
  impacts: Impacts,
  partners: Partners,
  how: How,
  contact: Contact,
};

const AboutPage = (props) => (
  <div className="l-about-page">
    <Cover
      title="About"
      description="Global Forest Watch (GFW) is an online platform that provides data and tools for monitoring forests. By harnessing cutting-edge technology, GFW allows anyone to access near real-time information about where and how forests are changing around the world."
      bgImage={bgImage}
    >
      <Link href="/subscribe">
        <a className="subscribe-btn">
          <Button round className="subscribe-icon">
            <Icon icon={mailIcon} />
          </Button>
          <p className="subscribe-msg">SUBSCRIBE TO THE GFW NEWSLETTER</p>
        </a>
      </Link>
    </Cover>
    <SubnavMenu className="about-links" links={Object.values(sections || {})} />
    <Projects {...props} />
    {sections &&
      Object.keys(sections).map((s) => {
        const section = sections[s];
        const PageComponent = sectionComponents[section.component];
        return PageComponent ? (
          <div
            id={section.anchor}
            className={section.anchor}
            key={section.anchor}
          >
            <PageComponent {...props} />
          </div>
        ) : null;
      })}
    <Join />
  </div>
);

export default AboutPage;
