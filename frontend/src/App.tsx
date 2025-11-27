import AppRoutes from './routes';
import Navbar from './components/Navbar';
import { Container } from '@mui/material';
import { FileProvider } from './contexts/FileContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <FileProvider>
          <AppRoutes />
        </FileProvider>
      </Container>
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
