import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SiteDataProvider } from '@/context/SiteDataContext';
import Layout from '@/components/layout/Layout';
import NotFound from '@/pages/NotFound';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const ResearchAreas = lazy(() => import('@/pages/ResearchAreas'));
const ResearchAreaDetail = lazy(() => import('@/pages/ResearchAreaDetail'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const ScientificVisuals = lazy(() => import('@/pages/ScientificVisuals'));
const PublicationSupport = lazy(() => import('@/pages/PublicationSupport'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Insights = lazy(() => import('@/pages/Insights'));
const InsightDetail = lazy(() => import('@/pages/InsightDetail'));
const Contact = lazy(() => import('@/pages/Contact'));
const Faqs = lazy(() => import('@/pages/Faqs'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-navy-200 border-t-teal-500 rounded-full animate-spin"></div>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SiteDataProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <About />
                  </Suspense>
                }
              />
              <Route
                path="/services"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Services />
                  </Suspense>
                }
              />
              <Route
                path="/services/:slug"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ServiceDetail />
                  </Suspense>
                }
              />
              <Route
                path="/research-areas"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ResearchAreas />
                  </Suspense>
                }
              />
              <Route
                path="/research-areas/:slug"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ResearchAreaDetail />
                  </Suspense>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Portfolio />
                  </Suspense>
                }
              />
              <Route
                path="/portfolio/:slug"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ProjectDetail />
                  </Suspense>
                }
              />
              <Route
                path="/scientific-visuals"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ScientificVisuals />
                  </Suspense>
                }
              />
              <Route
                path="/publication-support"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <PublicationSupport />
                  </Suspense>
                }
              />
              <Route
                path="/testimonials"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Testimonials />
                  </Suspense>
                }
              />
              <Route
                path="/insights"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Insights />
                  </Suspense>
                }
              />
              <Route
                path="/insights/:slug"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <InsightDetail />
                  </Suspense>
                }
              />
              <Route
                path="/contact"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Contact />
                  </Suspense>
                }
              />
              <Route
                path="/faqs"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Faqs />
                  </Suspense>
                }
              />
              <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><LegalPage kind="privacy" /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<PageFallback />}><LegalPage kind="terms" /></Suspense>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SiteDataProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
