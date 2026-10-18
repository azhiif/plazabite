import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plazabite.partner',
  appName: 'PlazaBite Partner',
  webDir: 'out',
  server: {
    url: 'https://plazabite.vercel.app/partner',
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_orders',
      iconColor: '#E50914',
      sound: 'order_chime.wav'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF'
    }
  }
};

export default config;
