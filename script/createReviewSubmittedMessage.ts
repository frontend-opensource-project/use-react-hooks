import users from './constant';

function createReviewSubmittedMessage(event) {
  const reviewer = event.review.user.login;
  const reviewerId = users[reviewer];
  const prOwner = event.pull_request.user.login;
  const prOwnerId = users[prOwner];
  const reviewUrl = event.review.html_url;

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
              text: ' 님이 ',
            },
            {
              type: 'user',
              user_id: prOwnerId,
            },
            {
              type: 'text',
              text: ' 님의 PR에 ',
            },
            {
              type: 'emoji',
              name: 'link',
              unicode: '1f517',
            },
            {
              type: 'link',
              url: reviewUrl,
              text: '리뷰',
            },
            {
              type: 'text',
              text: '를 등록했어요.',
            },
          ],
        },
      ],
    },
  ];

  return { blocks };
}

export default createReviewSubmittedMessage;
