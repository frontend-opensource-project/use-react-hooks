/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const users = require('./constant.cjs');

function createReviewerAssignedMessage(event) {
  const prOwner = event.pull_request.user.login;
  const prOwnerId = users[prOwner];
  const reviewer = event.pull_request.requested_reviewer.login;
  const reviewerId = users[reviewer];
  const prUrl = event.pull_request.html_url;

  const blocks = [
    {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_section',
          elements: [
            {
              type: 'user',
              user_id: reviewerId,
            },
            {
              type: 'text',
              text: ' 님이 리뷰어로 등록되었어요.\n',
            },
          ],
        },
        {
          type: 'rich_text_list',
          style: 'bullet',
          border: 1,
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  text: 'PR Author: ',
                },
                {
                  type: 'user',
                  user_id: prOwnerId,
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ],
            },
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  text: 'PR 바로가기: ',
                },
                {
                  type: 'link',
                  url: prUrl,
                  text: 'Click Me',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return { blocks };
}

module.exports = createReviewerAssignedMessage;
