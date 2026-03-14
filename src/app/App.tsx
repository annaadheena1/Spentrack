import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Mobile Frame */}
      <div className="w-full max-w-md h-[800px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-slate-800 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-50"></div>
        
        {/* App Content */}
        <div className="h-full overflow-auto">
          <RouterProvider router={router} />
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}