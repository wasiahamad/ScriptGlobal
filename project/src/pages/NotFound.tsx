import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | SciScript Global</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-navy-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-navy-800 mb-3">Page Not Found</h1>
          <p className="text-navy-500 mb-6 max-w-md mx-auto">
            The page you are looking for may have been moved, removed, or is temporarily unavailable.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 text-sm font-semibold bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
