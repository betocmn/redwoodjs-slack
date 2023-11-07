
export default async (req, context) => {
  const clientId = Netlify.env.get("SLACK_CLIENT_ID");
  const redirectUri = Netlify.env.get("INSTALL_REDIRECT_URI");

  const scopes = ['chat:write', 'channels:history', 'commands', 'channels:read']
  return Response.redirect(`https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&client_id=${clientId}`, 301);
};
