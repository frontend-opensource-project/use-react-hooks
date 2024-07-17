import * as core from '@actions/core';
import * as github from '@actions/github';
import { pullRequestReviewSubmittedMessage } from './utils/slack';
import { notifySlack } from './notifySlack';

const SUPPORTED_EVENTS = ['pull_request_review', 'pull_request_review_comment'];

const { eventName, payload } = github.context;

export const handleGitHubEvent = async () => {
  try {
    core.info('🔥 Run.....');
    core.info(`eventName = ${eventName}`);
    core.info(`action = ${payload.action}`);

    if (!SUPPORTED_EVENTS.includes(eventName)) {
      core.warning(`✋🏻 '${eventName}' is not supported event.`);
      return;
    }

    if (eventName === null) {
      return;
    }

    switch (eventName) {
      case 'pull_request_review':
        if (payload.action === 'submitted') {
          await notifySlack(pullRequestReviewSubmittedMessage(payload));
        }
        break;

      default:
        break;
    }
  } catch (error) {
    core.setFailed(error as Error);
  }
};
