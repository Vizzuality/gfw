/* eslint-disable react/no-danger */
import React from 'react';
import Document, { Html, Main, NextScript, Head } from 'next/document';
import sprite from 'svg-sprite-loader/runtime/sprite.build';

import { mediaStyles } from 'gfw-components';

const isProduction = process.env.NODE_ENV === 'production';

export default class MyDocument extends Document {
  render() {
    const spriteContent = sprite.stringify();

    return (
      <Html lang="en">
        <Head>
          <style
            type="text/css"
            dangerouslySetInnerHTML={{ __html: mediaStyles }}
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

          <meta
            name="google-site-verification"
            content="xx82D6cZ40Hvf-TT9jkhfsVi11yIeShPcK0zcc7m7ak"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap"
            rel="stylesheet"
          />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link
            rel="mask-icon"
            href="/favicon/safari-pinned-tab.svg"
            color="#5bbad5"
          />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />

          <script
            type="text/javascript"
            src="/scripts/transifex.js"
            rel="preconnect"
          />
          <script
            type="text/javascript"
            src="//cdn.transifex.com/live.js"
            rel="preconnect"
          />

          {isProduction && (
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-JVWWXY8NP3"
            />
          )}

          {isProduction && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-JVWWXY8NP3');
                `,
              }}
            />
          )}
        </Head>
        <body>
          <div dangerouslySetInnerHTML={{ __html: spriteContent }} />
          <main id="maincontent">
            <Main />
          </main>
          <NextScript />
        </body>
      </Html>
    );
  }
}
