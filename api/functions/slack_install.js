
export default async (req, context) => {
  const clientId = process.env.SLACK_CLIENT_ID;

  const scopes = ['chat:write', 'channels:history', 'commands', 'channels:read']
  return Response.redirect(`https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&client_id=${clientId}`, 301);
};
