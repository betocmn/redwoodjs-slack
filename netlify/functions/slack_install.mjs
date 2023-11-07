

module.exports = {
  handler: async (event, context) => {
    console.log(event.body);
    const  clientId = process.env.SLACK_CLIENT_ID
    const redirectUri = process.env.INSTALL_REDIRECT_URI

    const scopes = ['chat:write', 'channels:history', 'commands', 'channels:read']
    try {
      return Response.redirect(`https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&client_id=${clientId}&redirect_uri=${redirectUri}`, 301);

    } catch (error) {
      return new Response(error, 500)
    }
  }
};
