export const handler = async (event, context) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const scopes = ['chat:write', 'channels:history', 'commands', 'channels:read'];

  return {
    statusCode: 301,
    headers: {
      'Location': `https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&client_id=${clientId}`
    },
  };
};
