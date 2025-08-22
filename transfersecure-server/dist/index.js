import fastify, {} from 'fastify';
import * as client from 'openid-client';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
import 'dotenv/config';
const server = fastify();
server.register(fastifyCookie);
server.register(fastifySession, {
    secret: process.env.SESSION_SECRET_KEY,
    cookie: {
        secure: false,
    },
});
server.get('/ping', async (request, reply) => {
    return 'pong\n';
});
var poolData = {
    UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
    ClientId: process.env.CLIENT_ID, // Your client id here
};
var userPool = new CognitoUserPool(poolData);
const url = new URL(process.env.SERVER);
let config = await client.discovery(url, process.env.CLIENT_ID, process.env.CLIENT_SECRET);
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    console.log(process.env.SERVER);
});
let isAuthentcated = false;
const authHandler = (request, reply) => {
    if (request.session) {
        // Session object exists, a session is likely active
        // console.log('Session is set:', request.session);
        isAuthentcated = true;
    }
    reply.send(isAuthentcated);
};
server.get('/', { preHandler: authHandler }, (request, reply) => {
    // if (isAuthentcated == true){
    //   // reply.redirect("")
    //   console.log("Authentitcated")
    //   // return isAuthentcated
    // }else{
    //   console.log("Sad")
    // }
    reply.send(isAuthentcated);
});
server.post('/register', async (request, reply) => {
    console.log(request);
    const { email, password } = request.body;
    userPool.signUp(email, password, [], [], (err, result) => {
        if (err) {
            console.log(err);
            return reply.status(500).send('Error registering user');
        }
        const cognitoUser = result.user;
        console.log('User registered successfully:', cognitoUser.getUsername());
        reply.send('User registered successfully');
    });
});
server.post('/login', async (request, reply) => {
    // var attributeList = [];
    // const { email, password } = request.body as loginData;
    // let emailVariable = {
    //     Name: 'email',
    //     Value: email,
    // };
    // var attributeEmail = new CognitoUserAttribute(emailVariable);
    // attributeList.push(attributeEmail);
    // userPool.signUp(email, password, attributeList, [], function (err, result) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     var cognitoUser = result!.user;
    //     console.log('user name is ' + cognitoUser.getUsername());
    // });
    const { email, password } = request.body;
});
//# sourceMappingURL=index.js.map