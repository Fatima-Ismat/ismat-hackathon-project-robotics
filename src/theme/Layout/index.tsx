import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import { useLocation } from '@docusaurus/router';
import ChatWidget from '../../components/ChatWidget';

// Feature flag to enable/disable ChatWidget
// Set to false to use Railway AI button instead
const ENABLE_CHAT_WIDGET = false;

export default function Layout(props: any) {
  const location = useLocation();
  const { pathname } = location;

  const isHomePage =
    pathname === '/' ||
    pathname === '/ismat-hackathon-project-robotics/' ||
    pathname === '/ismat-hackathon-project-robotics';

  const isDocsPage =
    pathname.startsWith('/docs') ||
    pathname.startsWith('/ismat-hackathon-project-robotics/docs');

  const isAboutPage =
    pathname === '/about' ||
    pathname === '/ismat-hackathon-project-robotics/about';

  const isContactPage =
    pathname === '/contact' ||
    pathname === '/ismat-hackathon-project-robotics/contact';

  const shouldShowChat =
    ENABLE_CHAT_WIDGET &&
    (isHomePage || isDocsPage) && !isAboutPage && !isContactPage;

  return (
    <>
      <OriginalLayout {...props} />
      {shouldShowChat && <ChatWidget />}
    </>
  );
}
