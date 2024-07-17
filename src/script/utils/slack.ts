import { WebhookPayload } from '@actions/github/lib/interfaces';
import user from '../constants/user';
import { RichTextBlock } from '@slack/bolt';

const getSlackUser = (userName: string) => {
  return user[userName as keyof typeof user];
};

export const pullRequestReviewSubmittedMessage = (
  payload: WebhookPayload
): RichTextBlock[] => {
  return [
    {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_section',
          elements: [
            {
              type: 'user',
              user_id: getSlackUser(payload.review?.user.login),
            },
            {
              type: 'text',
              text: ' 님이 ',
            },
            {
              type: 'user',
              user_id: getSlackUser(payload.pull_request?.user.login),
            },
            {
              type: 'text',
              text: ' 님의 PR에 ',
            },
            {
              type: 'link',
              url: payload.review?._links.html.href,
              text: '리뷰',
            },
            {
              type: 'text',
              text: '를 작성했어요.',
            },
          ],
        },
      ],
    },
  ];
};
