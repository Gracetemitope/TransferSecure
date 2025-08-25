import fastify from 'fastify';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import { Amplify } from 'aws-amplify';
import 'dotenv/config';
const server = fastify();
server.register(fastifyCookie);
server.register(fastifySession, {
    secret: process.env.SESSION_SECRET_KEY,
    cookie: {
        secure: false,
    },
});
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: process.env.CLIENT_ID,
            userPoolId: process.env.USER_POOL_ID,
            signUpVerificationMethod: 'code',
        },
    },
});
server.get('/ping', async (request, reply) => {
    return 'pong\n';
});
server.post('/register', async (request, reply) => { });
server.post('/login', async (request, reply) => { });
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    console.log(process.env.SERVER);
});
//# sourceMappingURL=index.js.map