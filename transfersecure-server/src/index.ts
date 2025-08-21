import fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import * as client from 'openid-client';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import {
	CognitoUserPool,
	CognitoUserAttribute,
	CognitoUser,
} from 'amazon-cognito-identity-js';
import 'dotenv/config'


const server = fastify()
server.register(fastifyCookie);
server.register(fastifySession, {secret: process.env.SESSION_SECRET_KEY  as string, cookie :{
  secure: false
}})
server.get('/ping', async (request, reply) => {
  return 'pong\n'
})


var poolData = {
	UserPoolId: 'us-east-1_jEDZdMqE9', // Your user pool id here
	ClientId: process.env.CLIENT_ID as string // Your client id here
};
var userPool = new CognitoUserPool(poolData);

let user
const openIdServer: string = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_jEDZdMqE9"
const url = new URL(process.env.SERVER as string);

let config: client.Configuration = await  client.discovery(url,process.env.CLIENT_ID as string,process.env.CLIENT_SECRET as string)





server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  
  console.log(`Server listening at ${address}`)
  console.log(process.env.SERVER)
})

let isAuthentcated = false
const authHandler = (request:FastifyRequest, reply:FastifyReply)=>{
      if (request.session) {
        // Session object exists, a session is likely active
        // console.log('Session is set:', request.session);
        isAuthentcated = true
      
      } 
      reply.send(isAuthentcated)
}
server.get('/',{preHandler: authHandler},(request, reply) => {
  // if (isAuthentcated == true){
  //   // reply.redirect("")
  //   console.log("Authentitcated")
  //   // return isAuthentcated
  // }else{
  //   console.log("Sad")
  // }
  reply.send(isAuthentcated)

})

server.post('/login',async (request, reply) => {
// let redirect_uri: string = "https://d84l1y8p4kdic.cloudfront.net"
// let scope: string =  'email openid phone'

// let code_verifier: string = client.randomPKCECodeVerifier()
// let code_challenge: string = await client.calculatePKCECodeChallenge(code_verifier)
// let state!: string

// let parameters: Record<string, string> = {
//   redirect_uri,
//   scope,
//   code_challenge,
//   code_challenge_method: 'S256',
// }

// if (!config.serverMetadata().supportsPKCE()) {
//   /**
//    * We cannot be sure the server supports PKCE so we're going to use state too.
//    * Use of PKCE is backwards compatible even if the AS doesn't support it which
//    * is why we're using it regardless. Like PKCE, random state must be generated
//    * for every redirect to the authorization_endpoint.
//    */
//   state = client.randomState()
//   parameters.state = state
// }

// const  redirectTo:URL = client.buildAuthorizationUrl(config, parameters)

// // now redirect the user to redirectTo.href
// console.log('redirecting to', redirectTo.href)
var attributeList = [];
// console.log(request.body)
const {email, password} = request.body  as loginData
let emailVariable ={
  "Name": 'email',
  'Value': email
}
var attributeEmail = new CognitoUserAttribute(emailVariable);
attributeList.push(attributeEmail)
userPool.signUp(email, password,attributeList, [], function (err, result) {
		if (err) {
			// alert(err.message || JSON.stringify(err));
      console.log(err)
			return;
		}
		var cognitoUser = result!.user;
		console.log('user name is ' + cognitoUser.getUsername());
	})

})

interface loginData {
  email:string,
  password: string
}