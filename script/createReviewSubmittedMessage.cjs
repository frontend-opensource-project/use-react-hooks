/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const users = require('./constant.cjs');

function createReviewSubmittedMessage(event) {
  const reviewer = event.review.user.login;
  const reviewerId = users[reviewer];
  const prOwner = event.pull_request.user.login;
  const prOwnerId = users[prOwner];
  const reviewUrl = event.review.html_url;
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
              user_id: prOwnerId,
            },
            {
              type: 'text',
              text: ' 님의 PR에 리뷰가 등록되었어요.\n',
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
                  text: '리뷰어: ',
                },
                {
                  type: 'user',
                  user_id: reviewerId,
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
                  text: '리뷰 바로가기: ',
                },
                {
                  type: 'link',
                  url: reviewUrl,
                  text: 'Click Me',
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

module.exports = createReviewSubmittedMessage;
