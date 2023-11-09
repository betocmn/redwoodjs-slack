import { ExpressReceiver, LogLevel } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { Redis } from "@upstash/redis";

// Initialize Redis connection
const redis = Redis.fromEnv();

// Define an installation store for Slack app installations
const installationStore = {
  // Check if it's an Enterprise Install or a single Team App Install and save accordingly
  storeInstallation: async (installation) => {
    console.log('----> storeInstallation: ', installation)
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
      return await redis.set(installation.enterprise.id, installation);
    }
    if (installation.team !== undefined) {
      return await redis.set(installation.team.id, installation);
    }
    throw new Error('Failed saving installation data to installationStore');
  },
  // Function to fetch installation data
  fetchInstallation: async (installQuery) => {
    console.log('----> fetchInstallation: ', installQuery)
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      return await redis.get(installQuery.enterpriseId);
    }
    if (installQuery.teamId !== undefined) {
      return await redis.get(installQuery.teamId);
    }
    throw new Error('Failed fetching installation');
  },
  // Function to delete installation data
  deleteInstallation: async (installQuery) => {
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      return await redis.del(installQuery.enterpriseId);
    }
    if (installQuery.teamId !== undefined) {
      return await redis.del(installQuery.teamId);
    }
    throw new Error('Failed to delete installation');
  },
}

// Define an authorization function
const authorizeFn = async ({ teamId, enterpriseId }) => {
  console.log('----> authorizeFn: ', teamId, enterpriseId)
  const key = enterpriseId || teamId
  if (key){
    const installation = await redis.get(key)
    console.log('----> authorizeFn return : ', installation)
    return {
      botToken: installation.bot.token,
      botUserId: installation.bot.userId,
      userId: installation.user.id,
      teamId: installation.team?.id,
      enterpriseId: installation.enterprise?.id,
    }
  }
  throw new Error('No matching authorizations');
}

export const installExpressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true, // required to be true for OAuth
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'test',
  logLevel: LogLevel.DEBUG,
  scopes: [
    'chat:write',
    'channels:history',
    'commands',
    'channels:read',
  ],
  installerOptions: {
    legacyStateVerification: true,
  },
  installationStore: installationStore,
})
