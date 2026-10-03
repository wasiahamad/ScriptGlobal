import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import ScrollToTop from '@/components/ScrollToTop';
import { useSiteData } from '@/context/SiteDataContext';

export default function Layout() {
  const { settings } = useSiteData();
  const { pathname } = useLocation();
  const hasBreadcrumb = pathname !== '/';

  return (
    <div className="scientific-paper min-h-screen flex flex-col">
      <div className="site-scientific-background" aria-hidden="true">
        <div className="site-scientific-background-image" />
        <div className="site-scientific-background-wash" />
      </div>
      <ScrollToTop />
      <Navbar />
      <div className={`${hasBreadcrumb ? 'fixed' : 'hidden'} left-0 right-0 top-16 z-40 lg:top-20`}>
        <Breadcrumbs />
      </div>
      <main className={`flex-1 ${hasBreadcrumb ? 'pt-[7rem] lg:pt-[7.75rem]' : 'pt-0'}`}>
        <Outlet />
      </main>
      <Footer siteSettings={settings} />
    </div>
  );
}
