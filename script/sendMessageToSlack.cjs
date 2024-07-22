/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const createReviewerAssignedMessage = require('./createReviewerAssignedMessage.cjs');
const createReviewSubmittedMessage = require('./createReviewSubmittedMessage.cjs');

dotenv.config();

const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
console.log('GitHub Event: ', event);

const eventName = process.env.GITHUB_EVENT_NAME;

let message = {};

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
    break;
}

if (Object.keys(message).length > 0) {
  axios
    .post(SLACK_WEBHOOK_URL, message)
    .then((response) => {
      console.log('Slack message sent successfully: ', response);
    })
    .catch((error) => {
      throw new Error(error);
    });
} else {
  console.log('No message to send.');
}
