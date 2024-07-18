import users from './constant';

function createReviewerAssignedMessage(event) {
  const prOwner = event.pull_request.user.login;
  const prOwnerId = users[prOwner];
  const reviewers = event.pull_request.requested_reviewers.map(
    (reviewer) => users[reviewer.login]
  );
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
              user_id: reviewers.join(', '),
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
              text: ' 님의 ',
            },
            {
              type: 'emoji',
              name: 'link',
              unicode: '1f517',
            },
            {
              type: 'link',
              url: prUrl,
              text: 'PR',
            },
            {
              type: 'text',
              text: '에 리뷰어로 등록됐어요.',
            },
          ],
        },
      ],
    },
  ];

  return { blocks };
}

export default createReviewerAssignedMessage;
