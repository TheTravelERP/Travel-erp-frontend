import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router';
import { AuthProvider } from './auth/context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { AppThemeProvider } from './context/ThemeContext';
import SnackbarProvider from './components/ui/SnackbarProvider';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppThemeProvider>
          <SnackbarProvider>
            <MenuProvider>
              <AppRouter />
            </MenuProvider>
          </SnackbarProvider>
        </AppThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

