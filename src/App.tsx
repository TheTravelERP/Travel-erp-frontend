import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router';
import { AuthProvider } from './auth/context/AuthContext';
import { MenuProvider } from './context/MenuContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <AppRouter />
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

