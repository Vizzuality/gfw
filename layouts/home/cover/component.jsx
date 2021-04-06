import React, { useState } from 'react';
import YouTube from 'react-youtube';
import Link from 'next/link';
import cx from 'classnames';

import { Button } from 'gfw-components';

import Cover from 'components/cover';
import Icon from 'components/ui/icon';

import mailIcon from 'assets/icons/mail.svg?sprite';

import bgImage from './images/home-bg.jpg';

import './styles.scss';

const HomeCover = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <Cover
      className="c-home-cover"
      title="Forest Monitoring Designed for Action"
      description="Global Forest Watch offers the latest data, technology and tools that empower people everywhere to better protect forests."
      bgImage={bgImage}
      bgAlt="View of the earth from space"
      large
    >
      <>
        <div className={cx('home-video', { '-show': showVideo })}>
          <YouTube
            videoId="0XsJNU75Si0"
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 1,
                autohide: 1,
                loop: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 0,
                iv_load_policy: 3,
              },
            }}
            onPlay={() => setTimeout(() => setShowVideo(true), 300)}
            onEnd={() => setShowVideo(false)}
          />
        </div>
        {showVideo && (
          <Button
            className="stop-video-btn"
            onClick={() => setShowVideo(false)}
          >
            STOP VIDEO
          </Button>
        )}
        <Link href="/subscribe">
          <a className="subscribe-link">
            <Button round className="subscribe-btn">
              <Icon icon={mailIcon} />
            </Button>
            <span className="subscribe-msg">
              SUBSCRIBE TO THE GFW NEWSLETTER
            </span>
          </a>
        </Link>
      </>
    </Cover>
  );
};

export default HomeCover;
