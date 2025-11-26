// ============================================================================
// SECRETS MANAGER UTILITY - Retrieves secrets from AWS Secrets Manager
// ============================================================================

const AWS = require('aws-sdk');

// Initialize Secrets Manager client
const secretsManager = new AWS.SecretsManager({
    region: process.env.AWS_REGION || 'us-east-1'
});

// Cache for secrets to avoid repeated API calls
let secretsCache = null;

/**
 * Retrieves and caches secrets from AWS Secrets Manager
 * @returns {Object} Parsed secrets object
 */
async function getSecrets() {
    // Return cached secrets if available
    if (secretsCache) {
        return secretsCache;
    }

    try {
        const secretArn = process.env.SECRETS_MANAGER_ARN;
        if (!secretArn) {
            throw new Error('SECRETS_MANAGER_ARN environment variable not set');
        }

        const result = await secretsManager.getSecretValue({
            SecretId: secretArn
        }).promise();

        // Parse the secret string
        secretsCache = JSON.parse(result.SecretString);
        return secretsCache;
    } catch (error) {
        console.error('Error retrieving secrets:', error);
        throw error;
    }
}

module.exports = { getSecrets };
