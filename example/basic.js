/**
 Copyright © Oleg Bogdanov
 Developer: Oleg Bogdanov
 Contacts: https://github.com/wormen
 ---------------------------------------------
 */

const SDK = require('../');

const client = new SDK.Client({
  userId: 451,
  appId: '5d67decc88e4426a2cdc8321',
  secret: '4701df2b3fbb7c90677c5fc05c6457e9253273a86a94bff2da2dfab1994ed79b',
  scope: '[func:message:denyClone]'
});

client.on(SDK.EVENTS.TOKEN_DATA, (data) => {
  console.log('token data', data);
});

client.on(SDK.EVENTS.STATUS_MESSAGE, (data) => {
  console.log('message status', data);
});

client.on(SDK.EVENTS.MESSAGE_ID, (data) => {
  console.log('one message ID', data);
});

client.on(SDK.EVENTS.MESSAGE_BATCH, (data) => {
  console.log('message list id`s', data);
});

(async () => {
  await client.getToken();

  // отправка одиночного сообщения
  await client.sendOneMessage({
    channel: SDK.CHANNEL.SMS,
    sms_text: `test-${Date.now()}`,
    sms_sender: 'SmsGold',
    phone: '79141111111'
  })

  // пакетная отправка сообщения
  await client.sendBathMessage({
    channel: SDK.CHANNEL.SMS,
    sms_text: `test-${Date.now()}`,
    sms_sender: 'SmsGold',
    phones: [
      '79141111111'
    ]
  });
})();
