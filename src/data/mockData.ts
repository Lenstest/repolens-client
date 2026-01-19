import { Repository } from '@/types';

// Demo repositories - IDs must match backend (app/demo/repositories.py)
// Note: Graph data is now fetched from the backend API, not from client-side mock data
export const demoRepositories: Repository[] = [
  {
    id: 'demo_fastapi_backend',
    name: 'FastAPI Auth Service',
    url: 'https://github.com/demo/fastapi-auth',
    status: 'complete',
    nodeCount: 22,
    edgeCount: 19,
    fileCount: 3,
    lastAnalyzed: new Date().toISOString().split('T')[0],
    isDemo: true,
  },
  {
    id: 'demo_react_dashboard',
    name: 'React Dashboard',
    url: 'https://github.com/demo/react-dashboard',
    status: 'complete',
    nodeCount: 15,
    edgeCount: 12,
    fileCount: 3,
    lastAnalyzed: new Date().toISOString().split('T')[0],
    isDemo: true,
  },
  {
    id: 'demo_ecommerce_api',
    name: 'E-commerce API',
    url: 'https://github.com/demo/ecommerce-api',
    status: 'complete',
    nodeCount: 8,
    edgeCount: 6,
    fileCount: 1,
    lastAnalyzed: new Date().toISOString().split('T')[0],
    isDemo: true,
  },
];
