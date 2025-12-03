import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-400/30 to-purple-400/30 -z-10"></div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 text-lg mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Home size={20} />
            Go to Dashboard
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
