import fetch from 'node-fetch';
import { Redis } from '@upstash/redis';

const storeInstallation = async (redis, installation) => {
  if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
    return await redis.set(installation.enterprise.id, installation);
  }
  if (installation.team !== undefined) {
    return await redis.set(installation.team.id, installation);
  }
  throw new Error('Failed saving installation data to installationStore');
}


export default async (req, context) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  console.log('code: ', code);

  const clientId = Netlify.env.get("SLACK_CLIENT_ID");
  const clientSecret = Netlify.env.get("SLACK_CLIENT_SECRET");
  const slackOAuthURL = 'https://slack.com/api/oauth.v2.access';

  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);

  const response = await fetch(slackOAuthURL, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log('data: ', data);
    const redis = Redis.fromEnv();
    await storeInstallation(redis, data)
    return Response.json({ message: 'Access token stored succefully.' });
  } else {
    console.error('Error on oauth_redirect', error);
    return new Response('Error on oauth_redirect', { status: 500 });
  }
};

