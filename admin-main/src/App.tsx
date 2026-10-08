import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { ThemeProvider } from '@/lib/theme';
import AdminLayout from '@/components/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import { FullPageLoading } from '@/components/ui';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const ExpertisePage = lazy(() => import('@/pages/ExpertisePage'));
const ResearchPage = lazy(() => import('@/pages/ResearchPage'));
const PublicationsPage = lazy(() => import('@/pages/PublicationsPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ScientificVisualsPage = lazy(() => import('@/pages/ScientificVisualsPage'));
const FAQsPage = lazy(() => import('@/pages/FAQsPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const PageSettingsPage = lazy(() => import('@/pages/PageSettingsPage'));
const NavigationPage = lazy(() => import('@/pages/NavigationPage'));
const FooterPage = lazy(() => import('@/pages/FooterPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const GlobalSettingsPage = lazy(() => import('@/pages/GlobalSettingsPage'));
const MediaLibraryPage = lazy(() => import('@/pages/MediaLibraryPage'));
const GlobalSEOPage = lazy(() => import('@/pages/GlobalSEOPage'));
const PageSEOPage = lazy(() => import('@/pages/PageSEOPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const ActivityLogsPage = lazy(() => import('@/pages/ActivityLogsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ContactInquiriesPage = lazy(() => import('@/pages/ContactInquiriesPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoading />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/expertise" element={<ExpertisePage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/scientific-visuals" element={<ScientificVisualsPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/content/:pageKey" element={<PageSettingsPage />} />
        <Route path="/website/navigation" element={<NavigationPage />} />
        <Route path="/website/footer" element={<FooterPage />} />
        <Route path="/website/contact" element={<ContactPage />} />
        <Route path="/contact-inquiries" element={<ContactInquiriesPage />} />
        <Route path="/website/settings" element={<GlobalSettingsPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />
        <Route path="/seo/global" element={<GlobalSEOPage />} />
        <Route path="/seo/pages" element={<PageSEOPage />} />
        <Route path="/system/admin-users" element={<AdminUsersPage />} />
        <Route path="/system/activity-logs" element={<ActivityLogsPage />} />
        <Route path="/system/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
