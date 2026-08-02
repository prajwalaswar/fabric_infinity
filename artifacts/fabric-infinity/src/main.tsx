import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';
import App from './App';
import './index.css';

// Point all API calls to /api relative to the page origin
setBaseUrl('/api');

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
