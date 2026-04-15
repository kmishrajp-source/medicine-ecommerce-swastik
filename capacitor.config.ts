import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swastik.medicare',
  appName: 'SwastikMedicare',
  webDir: 'public',
  server: {
    url: 'https://medicine-ecommerce-swastik.vercel.app',
    cleartext: true,
    allowNavigation: [
      "*.razorpay.com",
      "upi:*",
      "paytmmp:*",
      "gpay:*",
      "phonepe:*"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#006D77"
    }
  }
};

export default config;
