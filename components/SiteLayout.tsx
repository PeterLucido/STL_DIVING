import Head from 'next/head';
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SiteLayout({ title, description, children }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
      </Head>
      <Header />
      {children}
      <Footer />
    </>
  );
}
