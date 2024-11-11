import { AuthWrapper } from '../components/AuthWrapper';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthWrapper>
      <Component {...pageProps} />
    </AuthWrapper>
  );
}