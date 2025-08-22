import fastify from 'fastify';
import { autoSignIn, cognitoUserPoolsTokenProvider, confirmSignIn, confirmSignUp, deleteUser, getCurrentUser, resendSignUpCode, signOut, } from 'aws-amplify/auth/cognito';
import { CookieStorage, defaultStorage } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signIn, signUp } from 'aws-amplify/auth';
import 'dotenv/config';
const server = fastify();
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: process.env.CLIENT_ID,
            userPoolId: process.env.USER_POOL_ID,
            signUpVerificationMethod: 'code',
        },
    },
});
// server.register(fastifyCors, {
//     origin: ['https://yourfrontend.com'], // whitelist
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// });
server.get('/ping', async (request, reply) => {
    return 'pong\n';
});
server.post('/register', {
    schema: {
        body: {
            type: 'object',
            required: ['firstName', 'lastName', 'email', 'password', 'zoneinfo'],
            properties: {
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                zoneinfo: { type: 'string', minLength: 3 },
            },
        },
    },
}, async (request, reply) => {
    const { firstName, lastName, email, password, zoneinfo } = request.body;
    try {
        const result = await signUp({
            username: firstName,
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
        reply.code(200).send(result);
    }
    catch (err) {
        console.error('Signup error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ error: err.message, details: err });
    }
});
server.post('/confirm', async (request, reply) => {
    const { username, confirmationCode } = request.body;
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
        reply.code(200).send(result);
    }
    catch (err) {
        let message = '';
        switch (err) {
            case 'ExpiredCodeException':
                message = 'The confirmation code has expired.';
                break;
            default:
                message = err.message;
                break;
        }
        console.error('Signup error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ error: message });
    }
});
server.post('/resend-confirmation', async (request, reply) => {
    const { email } = request.body;
    console.log(`Resending confirmation for ${email}`);
    try {
        const result = await resendSignUpCode({
            username: email,
        });
        reply.code(200).send(result);
    }
    catch (err) {
        console.error('Resend confirmation error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ error: err.message });
    }
});
server.post('/login', async (request, reply) => {
    const { email, password, newPassword } = request.body;
    try {
        const result = await signIn({
            username: email,
            password: password,
            options: {
                authFlowType: 'USER_PASSWORD_AUTH',
            },
        });
        if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
            if (!newPassword) {
                return reply.code(400).send({
                    error: 'NEW_PASSWORD_REQUIRED',
                    message: 'User must set a new password.',
                });
            }
            const confirmed = await confirmSignIn({
                challengeResponse: newPassword,
            });
            if (confirmed.isSignedIn) {
                const { username, userId } = await getCurrentUser();
                const session = await fetchAuthSession();
                const tokens = {
                    accessToken: session.tokens?.accessToken,
                    idToken: session.tokens?.idToken,
                    userName: username,
                    userId: userId,
                };
                return reply.code(200).send(tokens);
            }
        }
        if (result.isSignedIn) {
            const { username, userId } = await getCurrentUser();
            const session = await fetchAuthSession();
            const tokens = {
                accessToken: session.tokens?.accessToken,
                idToken: session.tokens?.idToken,
                userName: username,
                userId: userId,
            };
            return reply.code(200).send(tokens);
        }
        return reply.code(400).send({
            error: 'CHALLENGE_REQUIRED',
            message: result.nextStep.signInStep,
        });
    }
    catch (err) {
        reply.code(401).send({ error: err.message });
    }
});
server.post('/sign-out', async (request, reply) => {
    await signOut({ global: true });
});
server.post('/refresh-token', async (request, reply) => {
    try {
        const result = await fetchAuthSession({ forceRefresh: true });
        reply.code(200).send(result);
    }
    catch (err) {
        reply.code(401).send({ error: err.message });
    }
});
server.post('/delete-account', async (request, reply) => {
    try {
        await deleteUser();
    }
    catch (err) {
        reply.code(500).send({ error: err.message });
    }
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    console.log(process.env.SERVER);
});
//# sourceMappingURL=index.js.map