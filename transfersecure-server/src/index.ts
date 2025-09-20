import fastify from 'fastify';
import {
    autoSignIn,
    cognitoUserPoolsTokenProvider,
    confirmResetPassword,
    confirmSignUp,
    resendSignUpCode,
    resetPassword,
} from 'aws-amplify/auth/cognito';
import {
    CognitoIdentityProviderClient,
    GetUserCommand,
    InitiateAuthCommand,
    ChangePasswordCommand,
    UpdateUserAttributesCommand,
    GlobalSignOutCommand,
    DeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CookieStorage, defaultStorage } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signUp } from 'aws-amplify/auth';
import crypto from 'crypto';
import cors from '@fastify/cors';
import 'dotenv/config';
import multipart, { type MultipartFile } from '@fastify/multipart';
import { calculateFutureDateTime, generateFileHash } from './fileHash.js';
import axios from 'axios';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from '@fastify/rate-limit';
import { getSecrets } from './helper.js';

// ssl certificate
// const options = {
//   https: {
//     key: fs.readFileSync('private.key'),
//     cert: fs.readFileSync('certificate.crt'),
//   }
// };

const secrets = await getSecrets();

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
});

const dbclient = new DynamoDBClient({ region: 'us-east-1' });

const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

const docClient = DynamoDBDocumentClient.from(dbclient);

const server = fastify();

await server.register(cors as any, {
    origin: ['https://main.dw0t9e0p5k4fj.amplifyapp.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

await server.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
});

await server.register(multipart);

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: secrets.CLIENT_ID as string,
            userPoolId: secrets.USER_POOL_ID as string,
            signUpVerificationMethod: 'code',
        },
    },
    Storage: {
        S3: {
            bucket: 'securefile-transfer3c92a-dev',
            region: 'us-east-1',
        },
    },
});

function generateUserName(email: string): string {
    const raw = email.toLowerCase();
    return crypto
        .createHash('sha256')
        .update(raw)
        .digest('hex')
        .slice(0, 32);
}

server.get('/ping', async (request, reply) => {
    return 'pong\n';
});

server.post(
    '/register',
    {
        schema: {
            body: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password', 'zoneinfo'],
                properties: {
                    firstName: { type: 'string', minLength: 1 },
                    lastName: { type: 'string', minLength: 1 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    zoneinfo: { type: 'string', minLength: 2 },
                },
            },
        },
    },
    async (request, reply) => {
        const { firstName, lastName, email, password, zoneinfo } = request.body as {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            zoneinfo: string;
        };

        try {
            const userName = generateUserName(email);

            const result = await signUp({
                username: userName,
                password: password,
                options: {
                    userAttributes: {
                        email: email,
                        given_name: firstName,
                        family_name: lastName,
                        zoneinfo: zoneinfo,
                    },
                },
            });

            reply.code(200).send({
                success: true,
                data: { username: userName },
            });
        } catch (err) {
            let message = 'Unknown error';

            console.log(err);

            if ((err as Error).name === 'UsernameExistsException') {
                message = 'Email already registered';
            } else if ((err as Error).name === 'InvalidPasswordException') {
                message = 'Password does not meet complexity requirements';
            } else if ((err as Error).name === 'CodeMismatchException') {
                message = 'Invalid verification code';
            } else if ((err as Error).name === 'ExpiredCodeException') {
                message = 'Verification code expired';
            } else {
                message = (err as Error).name;
            }

            reply.code(400).send({ success: false, error: (err as Error).message, details: message });
        }
    },
);

server.post('/confirm', async (request, reply) => {
    const { username, confirmationCode } = request.body as { username: string; confirmationCode: string };
    console.log(`Confirming sign up for ${username} with code ${confirmationCode}`);

    try {
        const result = await confirmSignUp({
            username: username,
            confirmationCode: confirmationCode,
        });
        console.log(result.isSignUpComplete ? 'User confirmed successfully.' : result.nextStep.signUpStep);

        if (result.nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            const { nextStep } = await autoSignIn();

            if (nextStep.signInStep === 'DONE') {
                console.log('Successfully signed in.');
            }
        }
        return reply.code(200).send({
            success: true,
            message: result.isSignUpComplete ? 'User confirmed successfully.' : 'Further steps required.',
            data: { nextStep: result.nextStep?.signUpStep ?? 'DONE' },
        });
    } catch (err) {
        let message = '';
        switch (err) {
            case 'ExpiredCodeException':
                message = 'The confirmation code has expired.';
                break;
            default:
                message = (err as Error).message;
                break;
        }
        console.error('Signup error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ code: (err as Error).name, error: message, success: false });
    }
});

server.post('/resend-confirmation', async (request, reply) => {
    const { email } = request.body as { email: string };
    console.log(`Resending confirmation for ${email}`);

    try {
        const result = await resendSignUpCode({
            username: email,
        });
        reply.code(200).send({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error('Resend confirmation error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ error: (err as Error).message, success: false });
    }
});

server.post('/login', async (request, reply) => {
    const { email, password } = request.body as {
        email: string;
        password: string;
    };

    try {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: secrets.CLIENT_ID!,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });

        const response = await cognitoClient.send(command);

        if (response.AuthenticationResult) {
            const accessToken = response.AuthenticationResult.AccessToken;
            const idToken = response.AuthenticationResult.IdToken;

            // Lấy user info
            const userResponse = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken! }));

            const attributes: Record<string, string> = {};
            userResponse.UserAttributes?.forEach((attr) => {
                if (attr.Name && attr.Value) {
                    attributes[attr.Name] = attr.Value;
                }
            });
            const tokens = {
                accessToken: accessToken,
                idToken: idToken,
                userId: attributes.sub,
                userName: userResponse.Username,
                email: attributes.email,
                firstName: attributes.given_name,
                lastName: attributes.family_name,
                zoneinfo: attributes.zoneinfo,
            };

            return reply.code(200).send({
                success: true,
                result: tokens,
            });
        }

        return reply.code(400).send({
            success: false,
            error: 'CHALLENGE_REQUIRED',
            nextStep: response.ChallengeName,
        });
    } catch (err) {
        console.error('Login error:', err);
        return reply.code(401).send({
            success: false,
            error: (err as Error).message,
        });
    }
});

server.put('/change-password', async (request, reply) => {
    const authHeader = request.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
        return reply.code(401).send({
            success: false,
            error: 'Access token is required',
        });
    }

    const { oldPassword, newPassword, confirmNewPassword } = request.body as {
        oldPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    };

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return reply.code(400).send({
            success: false,
            error: 'All fields are required',
        });
    }

    if (newPassword !== confirmNewPassword) {
        return reply.code(400).send({
            success: false,
            error: 'New password and confirmation do not match',
        });
    }

    try {
        const command = new ChangePasswordCommand({
            PreviousPassword: oldPassword,
            ProposedPassword: newPassword,
            AccessToken: accessToken,
        });
        await cognitoClient.send(command);

        return reply.code(200).send({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (err) {
        console.error('Error changing password:', err);
        return reply.code(400).send({
            success: false,
            error: (err as Error).message,
        });
    }
});

server.post(
    '/update-profile',
    {
        schema: {
            body: {
                type: 'object',
                required: ['firstName', 'lastName', 'zoneinfo'],
                properties: {
                    firstName: { type: 'string', minLength: 1 },
                    lastName: { type: 'string', minLength: 1 },
                    zoneinfo: { type: 'string', minLength: 2 },
                },
            },
        },
    },
    async (request, reply) => {
        const authHeader = request.headers['authorization'];
        const accessToken = authHeader?.split(' ')[1];
        if (!accessToken) {
            return reply.code(401).send({
                success: false,
                error: 'Access token is required',
            });
        }

        const { firstName, lastName, zoneinfo } = request.body as {
            firstName: string;
            lastName: string;
            zoneinfo: string;
        };

        try {
            const getUserCommand = new GetUserCommand({
                AccessToken: accessToken,
            });
            const userResponse = await cognitoClient.send(getUserCommand);
            const attributes: Record<string, string> = {};
            userResponse.UserAttributes?.forEach((attr) => {
                if (attr.Name && attr.Value) {
                    attributes[attr.Name] = attr.Value;
                }
            });
            const user = {
                userId: attributes.sub!,
                username: userResponse.Username!,
                email: attributes.email!,
            };
            const updateAttributesCommand = new UpdateUserAttributesCommand({
                UserAttributes: [
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName },
                    { Name: 'zoneinfo', Value: zoneinfo },
                ],
                AccessToken: accessToken,
            });
            await cognitoClient.send(updateAttributesCommand);

            reply.code(200).send({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    userId: user.userId,
                    username: user.username,
                    email: attributes.email,
                    firstName: firstName,
                    lastName: lastName,
                    zoneinfo: zoneinfo,
                },
            });
        } catch (err) {
            console.error('Error updating profile:', err);

            reply.code(400).send({
                success: false,
                error: (err as Error).message,
            });
        }
    },
);

server.post('/sign-out', async (request, reply) => {
    try {
        const authHeader = request.headers['authorization'];
        const accessToken = authHeader?.split(' ')[1];
        if (!accessToken) {
            return reply.code(401).send({
                success: false,
                error: 'Access token is required',
            });
        }
        const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
        });
        await cognitoClient.send(command);
        reply.code(200).send({ success: true });
    } catch (error) {
        reply.code(500).send({ error: (error as Error).message, success: false });
    }
});

server.post('/refresh-token', async (request, reply) => {
    try {
        const { refreshToken } = request.body as { refreshToken: string };
        if (!refreshToken) {
            return reply.code(400).send({ success: false, error: 'refreshToken is required' });
        }
        const result = await cognitoClient.send(
            new InitiateAuthCommand({
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: secrets.CLIENT_ID,
                AuthParameters: {
                    REFRESH_TOKEN: refreshToken,
                },
            }),
        );

        reply.code(200).send({
            success: true,
            data: {
                accessToken: result.AuthenticationResult?.AccessToken,
                idToken: result.AuthenticationResult?.IdToken,
                expiresIn: result.AuthenticationResult?.ExpiresIn,
            },
        });
    } catch (err) {
        reply.code(401).send({ error: (err as Error).message, success: false });
    }
});

server.delete('/delete-account', async (request, reply) => {
    const authHeader = request.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
        return reply.code(401).send({
            success: false,
            error: 'Access token is required',
        });
    }
    try {
        await cognitoClient.send(
            new DeleteUserCommand({
                AccessToken: accessToken,
            }),
        );
        reply.code(200).send({ success: true });
    } catch (err) {
        reply.code(400).send({ success: false, error: (err as Error).message });
    }
});

server.post('/forgot-password', async (request, reply) => {
    const { email, confirmationCode, newPassword } = request.body as {
        email: string;
        confirmationCode?: string;
        newPassword?: string;
    };

    try {
        if (!confirmationCode) {
            const output = await resetPassword({ username: email });
            const { nextStep } = output;

            if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
                return reply.code(200).send({
                    success: true,
                    step: 'CODE_SENT',
                    delivery: nextStep.codeDeliveryDetails,
                });
            }
        } else {
            if (!newPassword) {
                return reply.code(400).send({ success: false, error: 'newPassword is required' });
            }

            await confirmResetPassword({
                username: email,
                confirmationCode: confirmationCode,
                newPassword: newPassword,
            });

            return reply.code(200).send({
                success: true,
                step: 'DONE',
                message: 'Password reset successfully',
            });
        }
    } catch (err) {
        return reply.code(500).send({ success: false, error: (err as Error).message });
    }
});

// '''
// FILE OPERATIONS
// '''

//

server.post('/file/:userId', async function(req, reply) {
    try {
        // Get all the multipart parts (files + fields)
        const parts = req.parts();

        let email: string | undefined;
        let duration: string | undefined;
        let fileName: string | undefined;
        const files: MultipartFile[] = [];

        // Get user ID from params
        const { userId } = req.params as { userId: string };
        // console.log("User ID:", userId);

        // Process each part once
        for await (const part of parts) {
            if (part.type === 'field') {
                if (part.fieldname === 'email') {
                    email = part.value as string;
                }
                if (part.fieldname === 'duration') {
                    duration = (await calculateFutureDateTime(parseInt(part.value as string))).toLocaleString();
                }
                if (part.fieldname === 'filename') {
                    fileName = part.value as string;
                }
            }

            if (part.type === 'file') {
                files.push(part);
                // console.log("User ID:", part);
            }
        }

        // console.log("Email:", email);
        // console.log("Duration:", duration);

        // Prepare results list
        const results: { filename: string; url?: string; malicious: boolean; size: string }[] = [];

        // Process each file
        for (const file of files) {
            const sha256 = await generateFileHash(file, 'sha256');

            const options = {
                method: 'GET',
                url: `https://www.virustotal.com/api/v3/files/${sha256}`,
                headers: {
                    accept: 'application/json',
                    'x-apikey': secrets.VIRUS_TOTAL as string,
                },
            };

            const res = await axios.request(options).catch((err) => err.response);
            const chunks: Buffer[] = [];
            for await (const chunk of file.file) chunks.push(chunk);

            const buffer = Buffer.concat(chunks);
            const fileKey = `${Date.now()}-${file.filename}`;

            let isMalicious = false;
            if (res?.status !== 404 && res?.data?.attributes?.last_analysis_stats?.malicious > 0) {
                isMalicious = true;
            }

            const filesize = (file.file.bytesRead / (1024 * 1024)).toFixed(2);

            if (!isMalicious) {
                // Upload to S3
                const command = new PutObjectCommand({
                    Bucket: 'securefile-transfer3c92a-dev',
                    Key: fileKey,
                    Body: buffer,
                    ContentLength: buffer.length,
                });
                await s3Client.send(command);

                // Get download URL
                const command1 = new GetObjectCommand({
                    Bucket: 'securefile-transfer3c92a-dev',
                    Key: fileKey,
                });
                const downloadUrl = await getSignedUrl(s3Client, command1, { expiresIn: 604800 });

                results.push({ filename: file.filename, url: downloadUrl, malicious: false, size: filesize });
            } else {
                results.push({ filename: file.filename, malicious: true, size: filesize });
            }
        }

        // Filter non-malicious files
        const cleanFiles = results.filter((f) => !f.malicious);

        if (cleanFiles.length > 0) {
            // Save metadata to DynamoDB
            const dbCommand = new PutCommand({
                TableName: 'Files',
                Item: {
                    id: uuidv4(),
                    user_id: userId,
                    file_name: fileName,
                    files: cleanFiles,
                    created_at: new Date().toLocaleString(),
                    duration: duration,
                    email: email,
                },
            });

            const dbRes = await docClient.send(dbCommand);

            if (dbRes.$metadata.httpStatusCode === 200) {
                return reply.code(200).send({ success: true, data: results });
            } else {
                return reply.code(500).send({ success: false });
            }
        }

        return reply.code(200).send({ success: true, data: results });
    } catch (error) {
        reply.code(500).send({ error: (error as Error).message, success: false });
    }
});

server.get('/user/file/:userId', async function(req, reply) {
    try {
        // Get user Id as a request parameter
        const { userId } = req.params as {
            userId: string;
        };

        // Get all files with the user iD attached to them
        const command = new QueryCommand({
            TableName: 'Files',
            IndexName: 'user_id-index',
            KeyConditionExpression: 'user_id = :u',
            ExpressionAttributeValues: {
                ':u': { S: userId },
            },
        });

        // Execute command
        const response = await docClient.send(command);

        const userFiles = response.Items!.map((item) => unmarshall(item));

        // Count the files
        const fileCount = userFiles.length;

        // Reply with user file information
        reply.code(200).send({ data: userFiles, success: true, totalFiles: fileCount });
    } catch (error) {
        reply.code(500).send({ error: (error as Error).message, success: false });
    }
});

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    // createTable
    console.log(`Server listening at ${address}`);
    console.log(secrets.SERVER);
});
