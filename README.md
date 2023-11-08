# RedwoodJS + Netlify + Slack Bolt JS Integration

This project aims to integrate RedwoodJS, Netlify, and Slack Bolt JS for building Slack applications.

## Getting Started

1. Fork this repository: [redwoodjs-project](https://github.com/en0c-026/redwoodjs-project).

2. Go to your Netlify account and create a new site. Authorize Netlify to access your forked repository and deploy the site.

3. After deploying, go to "Site Settings" and navigate to "Environment Variables."

4. Click the "Add variable" button, then select "Import from a .env file."

5. Paste the following content and fill in the variables:

```plaintext
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

You can find the Slack variables in your Slack app's API dashboard under "Settings" > "Basic Information."

For Upstash environment variables, create a new Redis database and generate the keys at [Upstash Console](https://console.upstash.com/login).

1. After adding the variables, click the "Import variables" button.
2. In your Netlify site, go to "Deploys" and trigger a new deploy by clicking "Deploy site again."

## Configuring Slack App

1. Configure your Slack app to receive events and interact correctly. Go to your Slack app dashboard and select "Event Subscriptions."
2. Activate events and set the request URL to the following:

```bash
https://{YOUR_NETLIFY_SITEID}.netlify.app/slack/events
```
Verify the URL, and it should be successfully verified.

3. Make sure to add at least one permission in "Subscribe to bot events," then save the changes.

4. Next, go to "Interactions & Shortcuts" and configure the request URL to the same URL as for events:

```bash
https://{YOUR_NETLIFY_SITEID}.netlify.app/slack/events
```
5. Finally, in "OAuth & Permissions," configure the following Redirect URL and save it:

```bash
https://{YOUR_NETLIFY_SITEID}.netlify.app/slack/oauth_redirect
```

Now, your Slack app is properly configured to interact with your application.

## Installing the App

1.Install the app in your Slack workspace by visiting:
```bash
https://{YOUR_NETLIFY_SITEID}.netlify.app/slack/install
```
2. Grant the necessary permissions, and if everything goes well, you should receive a JSON response:

```json
{
  "message": "Access token stored successfully."
}
```

Congratulations! Your app is now installed in your Slack workspace.