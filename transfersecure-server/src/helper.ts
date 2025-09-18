import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export async function getSecrets() {
    try {
        const client = new SecretsManagerClient({ region: 'us-east-1' });
        const secret_name = 'env_keys_2';

        let response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: 'AWSCURRENT',
            }),
        );

        if (!response.SecretString) {
            throw new Error('Secret not found or empty');
        }

        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
}
