import AppRoutes from './routes';
import Navbar from './components/Navbar';
// Removed Material-UI Container
import { FileProvider } from './contexts/FileContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // This now mostly contains Tailwind directives and shadcn base styles

function App() {
  return (
    <>
      <Navbar />
      {/* Replaced MUI Container with a div for main content */}
      <main className="container mx-auto px-4 py-8"> 
        <FileProvider>
          <AppRoutes />
        </FileProvider>
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
