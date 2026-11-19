import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tally.budgettracker',
  appName: 'Tally - Pocket Tracker',
  webDir: 'www',
  // Serve the local bundle over HTTP so the WebView can call the plain-HTTP
  // REST API on the LAN without mixed-content blocking.
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
