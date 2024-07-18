import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import createReviewerAssignedMessage from './createReviewerAssignedMessage';
import createReviewSubmittedMessage from './createReviewSubmittedMessage';

dotenv.config();

const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH as string;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;

async function sendMessageToSlack(): Promise<void> {
  const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
  const eventName = process.env.GITHUB_EVENT_NAME;

  let message: object = {};

  switch (eventName) {
    case 'pull_request':
      if (event.action === 'review_requested') {
        message = createReviewerAssignedMessage(event);
      }
      break;
    case 'pull_request_review':
      if (event.action === 'submitted') {
        message = createReviewSubmittedMessage(event);
      }
      break;
    default:
      console.log('No action needed for this event type.');
      return; // Now inside a function, this is legal
  }

  if (Object.keys(message).length > 0) {
    try {
      const response = await axios.post(SLACK_WEBHOOK_URL, message);
      console.log('Message sent: ', response.data);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  } else {
    console.log('No message to send.');
  }
}

sendMessageToSlack();
