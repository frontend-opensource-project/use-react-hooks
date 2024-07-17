import { App, RichTextBlock } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
});

export const notifySlack = async (blocks: RichTextBlock[]) => {
  await app.client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    blocks,
  });
};
