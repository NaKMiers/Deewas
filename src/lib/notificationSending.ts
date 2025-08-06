import { Expo, ExpoPushMessage } from 'expo-server-sdk'

let expo = new Expo()

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  subtitle: string = ''
) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`)
    return
  }

  const messages: ExpoPushMessage[] = [
    {
      to: pushToken,
      sound: 'default',
      title,
      subtitle,
      body,
      badge: 1,
    },
  ]

  let chunks = expo.chunkPushNotifications(messages)
  let tickets = []

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    } catch (error) {
      console.error(error)
    }
  }
}
