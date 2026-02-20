import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adam.publisher',
  appName: 'PublisherApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
