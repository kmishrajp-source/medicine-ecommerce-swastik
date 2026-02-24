import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swastik.medicare',
  appName: 'SwastikMedicare',
  webDir: 'public',
  server: {
    url: 'https://medicine-ecommerce-swastik.vercel.app',
    cleartext: true
  }
};

export default config;
