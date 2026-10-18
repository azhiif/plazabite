'use client'

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { PushNotifications } from '@capacitor/push-notifications'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const KITCHEN_CHANNEL_ID = 'plazabite_kitchen_orders'

/**
 * Initializes notification permissions and registers high-importance audio channel
 */
export async function initNativeNotifications(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false
  }

  try {
    // 1. Request Local Notification permissions
    const localStatus = await LocalNotifications.requestPermissions()
    if (localStatus.display !== 'granted') {
      console.warn('Local notification permission not granted:', localStatus.display)
    }

    // 2. Register Android Channel with Loud Audio Chime and High Priority
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: KITCHEN_CHANNEL_ID,
        name: 'PlazaBite Kitchen Orders',
        description: 'Loud sound alerts for incoming food court table orders',
        importance: 5, // 5 = High/Urgent
        visibility: 1, // Public
        sound: 'order_chime.wav',
        vibration: true,
        lights: true,
        lightColor: '#E50914'
      })
    }

    // 3. Register Push Notifications if available
    try {
      const pushStatus = await PushNotifications.requestPermissions()
      if (pushStatus.receive === 'granted') {
        await PushNotifications.register()
      }
    } catch (pushErr) {
      console.log('Push notification registration skipped or not configured:', pushErr)
    }

    return true
  } catch (err) {
    console.error('Failed to initialize native notifications:', err)
    return false
  }
}

/**
 * Plays a loud, crystal-clear 2-tone kitchen audio chime using the Web Audio API
 */
export function playKitchenSoundAlert() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    // First tone (higher pitch ding)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now) // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15) // D6
    gain1.gain.setValueAtTime(0.8, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.5)

    // Second resonant tone (loud alert gong)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(587.33, now + 0.2) // D5
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.4) // A5
    gain2.gain.setValueAtTime(0.9, now + 0.2)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.2)
    osc2.stop(now + 1.2)
  } catch (err) {
    console.warn('AudioContext alert playback failed:', err)
  }
}

/**
 * Dispatches high-priority notification with loud sound and haptic vibration
 */
export async function notifyNewOrder(params: {
  orderId: string
  tableNumber: string | number
  shopName: string
  itemsCount: number
  totalAmount: number
}) {
  // 1. Play in-app audio chime
  playKitchenSoundAlert()

  // 2. Trigger native haptic vibration
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Heavy })
      setTimeout(async () => {
        await Haptics.impact({ style: ImpactStyle.Heavy })
      }, 300)
    }
  } catch (hapticErr) {
    console.log('Haptics skipped:', hapticErr)
  }

  // 3. Schedule Local Notification with sound
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000),
            title: `🔔 New Order: Table #${params.tableNumber}`,
            body: `${params.itemsCount}x items (₹${params.totalAmount}) for ${params.shopName}`,
            channelId: KITCHEN_CHANNEL_ID,
            sound: 'order_chime.wav',
            extra: {
              orderId: params.orderId,
              tableNumber: params.tableNumber
            }
          }
        ]
      })
    }
  } catch (notifErr) {
    console.warn('LocalNotification schedule failed:', notifErr)
  }
}
