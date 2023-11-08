import fetch from 'node-fetch';
import { Redis } from '@upstash/redis';

const storeInstallation = async (redis, installation) => {
  if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
    await redis.set(installation.enterprise.id, installation);
  } else if (installation.team !== undefined) {
    await redis.set(installation.team.id, installation);
  } else {
    throw new Error('Failed saving installation data to installationStore');
  }
};

export const handler = async (event, context) => {
  const url = new URL(event.rawUrl);
  const code = url.searchParams.get('code');
  console.log('code: ', code);

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const slackOAuthURL = 'https://slack.com/api/oauth.v2.access';

  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);

  try {
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
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      await storeInstallation(redis, data);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Access token stored successfully.' }),
      };
    } else {
      const error = await response.text();
      console.error('Error on oauth_redirect', error);

      return {
        statusCode: 500,
        body: error,
      };
    }
  } catch (error) {
    console.error('Error on oauth_redirect', error);
    return {
      statusCode: 500,
      body: 'Error on oauth_redirect',
    };
  }
};
