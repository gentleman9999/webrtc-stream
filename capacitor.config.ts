import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adam.publisher',
  appName: 'PublisherApp',
  webDir: 'www',
  server: {
    url: 'https://webrtc-stream-cfvj.onrender.com/publisher?stream=sports01',
    cleartext: false
  }
};

export default config;
