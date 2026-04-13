import { localClient, initializeDemoData } from './localClient';

// Initialize demo data on app load
initializeDemoData();

// Export local client as 'base44' for compatibility
export const base44 = localClient;
