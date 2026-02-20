import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adam.publisher',
  appName: 'PublisherApp',
  webDir: 'www',
  server: {
    url: 'https://webrtc-stream-cfvj.onrender.com',
    cleartext: false
  }
};

export default config;
