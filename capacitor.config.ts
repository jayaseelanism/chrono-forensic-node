
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chronophoto.app',
  appName: 'ChronoPhoto',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
