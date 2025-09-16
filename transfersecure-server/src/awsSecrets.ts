import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretName = process.env.AWS_SECRET_NAME;
const region = 'us-east-1';

const client = new SecretsManagerClient({ region });

export async function getVirusTotalApiKey(): Promise<string> {
    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: 'AWSCURRENT',
            }),
        );

        if (!response.SecretString) {
            throw new Error('Secret not found');
        }
        return response.SecretString;

        // return JSON.parse(response.SecretString).apiKey;
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
}
