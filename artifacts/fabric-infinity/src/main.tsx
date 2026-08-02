import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// NOTE: do NOT call setBaseUrl('/api') here.
// The generated API client (lib/api-client-react) already has /api baked into
// every URL (e.g. `/api/products/featured`). Adding setBaseUrl would produce
// a double-prefix like /api/api/products/featured.

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
