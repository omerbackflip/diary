const path = require('path');
const { createOAuthClient, createFileTokenStore } = require('../../google/backend');

const tokenStore = createFileTokenStore(
  path.join(__dirname, '../config/token.json')
);

function getStoredTokens() {
  return tokenStore.load();
}

function hasStoredTokens() {
  return !!getStoredTokens();
}

function getOAuthClientFromStoredTokens() {
  const tokens = getStoredTokens();

  if (!tokens) {
    throw new Error('Google is not connected');
  }

  const oAuth2Client = createOAuthClient({
    clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });

  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

module.exports = {
  getStoredTokens,
  hasStoredTokens,
  getOAuthClientFromStoredTokens
};