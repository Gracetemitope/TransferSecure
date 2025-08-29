import fastify, { type FastifyRequest } from 'fastify';
import {
    autoSignIn,
    cognitoUserPoolsTokenProvider,
    confirmSignIn,
    confirmSignUp,
    deleteUser,
    getCurrentUser,
    resendSignUpCode,
    signOut,
} from 'aws-amplify/auth/cognito';
import { CookieStorage, defaultStorage } from 'aws-amplify/utils';
import { uploadData } from 'aws-amplify/storage';
import { Amplify} from 'aws-amplify';
import { fetchAuthSession, signIn, signUp } from 'aws-amplify/auth';
import crypto from 'crypto';
import cors from '@fastify/cors';
import 'dotenv/config';
import multipart, { type MultipartFile } from '@fastify/multipart';
import { generateFileHash } from './fileHash.js';
import axios from 'axios';
import { S3Client,PutObjectCommand ,GetObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, QueryCommand  } from "@aws-sdk/client-dynamodb"
import { PutCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: "us-east-1", // your S3 region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dbclient = new DynamoDBClient({region: "us-east-1"});

const docClient = DynamoDBDocumentClient.from(dbclient)

const server = fastify();

await server.register(cors as any, {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

await server.register(multipart);

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);


Amplify.configure( {
    Auth: {
        Cognito: {
            userPoolClientId: process.env.CLIENT_ID as string,
            userPoolId: process.env.USER_POOL_ID as string,
            signUpVerificationMethod: 'code',
        },
    },
    Storage:{
        S3:{
            bucket:"securefile-transfer3c92a-dev",
            region:"us-east-1"
        }
    },
    

});



function generateUserName(email: string): string {
    const raw = email.toLowerCase();
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
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
    const { email, password, newPassword } = request.body as {
        email: string;
        password: string;
        newPassword?: string;
    };

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

                return reply.code(200).send({
                    success: true,
                    result: tokens,
                });
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

            return reply.code(200).send({
                success: true,
                result: tokens,
            });
        }

        return reply.code(400).send({
            error: 'CHALLENGE_REQUIRED',
            message: result.nextStep.signInStep,
        });
    } catch (err) {
        reply.code(401).send({ error: (err as Error).message, success: false });
    }
});

server.post('/sign-out', async (request, reply) => {
    await signOut({ global: true });
    reply.code(200).send({ success: true });
});

server.post('/refresh-token', async (request, reply) => {
    try {
        const result = await fetchAuthSession({ forceRefresh: true });

        reply.code(200).send({
            success: true,
            data: result,
        });
    } catch (err) {
        reply.code(401).send({ error: (err as Error).message, success: false });
    }
});

server.post('/delete-account', async (request, reply) => {
    try {
        await deleteUser();
        reply.code(200).send({ success: true });
    } catch (err) {
        reply.code(500).send({ error: (err as Error).message, success: false });
    }
});

// '''
// FILE OPERATIONS
// '''

server.post('/file/:userId', async function (req, reply) {
    try {
    
        // Get all the multipart information passed in the form 
        const parts = req.files(); // Async generator
        
        // Get the user id passed in the path parameters
        const {userId} = req.params as {
            userId: string
        }
    
        // Creates a list for multipart files
        const files: MultipartFile[] = [];

        // Tracks the ma;icious status for all files
        const results: { filename: string; url?: string, malicious:boolean }[] = [];
        

        // Scan through all the info from the form data and pick seperate all the files
        for await (const file of parts) {
        
            if(file.type === "file"){
                files.push(file);
            }
        
        
        }

        // Loop through all the files
        for (const file of files) {

            // Generate the hash of each file
            const sha256 = await generateFileHash(file, 'sha256');
            

            // Call VirusTotal API to check the malicious status

            const options = {
                method: 'GET',
                url: `https://www.virustotal.com/api/v3/files/${sha256}`,
                headers: {
                    accept: 'application/json',
                    'x-apikey': process.env.VIRUS_TOTAL as string,
                },
            };

            const res = await axios
                .request(options)
                .then((res) => {return res.data})
                .catch((err) => {return err.response});
            
            
            const chunks = [];
            for await (const chunk of file.file) chunks.push(chunk);

            //get the file array buffer
            const buffer = Buffer.concat(chunks);

            // Create a file key with the date and filenam
            const fileKey = `${Date.now()}-${file.filename}`;

            // If the virus total status is 404 which mean the file hash is not in the malware database
            if(res.status && res.status === 404){

                // Store file in the S3 bucket
                const command = new PutObjectCommand({
                Bucket: "securefile-transfer3c92a-dev",
                Key: fileKey,
                Body: buffer,
                ContentLength: buffer.length,
                });
                
                // Get the recent file stored
                const command1 = new GetObjectCommand({ Bucket: "securefile-transfer3c92a-dev", Key: fileKey });
                
                // Generate the download url
                const downloadUrl = await getSignedUrl(s3Client, command1, { expiresIn: 604800 });

                // Track the file status
                results.push({filename:file.filename, url:downloadUrl, malicious:false})
                    
            }else {

                // If file exisit in virustotal database check malicious status
                const stats = await res.data.attributes.last_analysis_stats;

                // If malicious status is greater than 0 then dont store to s3
                if(stats.malicious > 0){
                    // Track file status
                    results.push({filename:file.filename, malicious:true})
                }else{
                     // Store file in the S3 bucket
                    const command = new PutObjectCommand({
                    Bucket: "securefile-transfer3c92a-dev",
                    Key: fileKey,
                    Body: buffer,
                    ContentLength: buffer.length,
                    });
                    // const res =  await s3Client.send(command);
                    
                    // Get the recent file stored
                    const command1 = new GetObjectCommand({ Bucket: "securefile-transfer3c92a-dev", Key: fileKey });
                    
                    // Generate the download url
                    const downloadUrl = await getSignedUrl(s3Client, command1, { expiresIn: 604800 });

                    // Track the file status
                    results.push({filename:file.filename, url:downloadUrl, malicious:false})
                
                }}
            }

            // Filter all files that are not malicious
            const clean_Obj = results.filter(element => element.malicious === false);
            
            
            // If there are none malicious file
            if (clean_Obj.length>0){

                //Upload the user file to Dynamo Db
                const testcommand = new PutCommand({
                    TableName: "Files",
                    Item: {
                        id:uuidv4(),
                        user_id: userId,
                        files: clean_Obj,
                        created_at: new Date().toLocaleString()
                    },
                });
        
                // Executes the command
                const res = await docClient.send(testcommand)

                // Track the status of upload
                if (res.$metadata.httpStatusCode === 200){
                    
                    reply.code(200).send({success: true ,data:results})
                }else {
                    reply.code(500).send({success: false })
                }
            
            }else{
                // If there are not safe file
                reply.code(200).send({success: true ,data:results})
            }
        
    }catch(error){
          reply.code(500).send({ error: (error as Error).message, success: false });
    }

});

server.get('/user/file/:userId', async function (req, reply){
    try {
        // Get user Id as a request parameter
        const {userId} = req.params as {
            userId: string
        }

        // Get all files with the user iD attached to them
        const command = new QueryCommand ({
            TableName: "Files",
            IndexName: "user_id-index",
            KeyConditionExpression: "user_id = :u",
            ExpressionAttributeValues: {
        ":u": { S: userId },
        },
        });


        // Execute command
        const response = await docClient.send(command)

        const userFiles = response.Items!.map(item => unmarshall(item))

        // Reply with user file information
        reply.code(200).send({data:userFiles,success: true })
        
    } catch (error) {
        reply.code(500).send({ error: (error as Error).message, success: false });
    }
    
})

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    // createTable
    console.log(`Server listening at ${address}`);
    console.log(process.env.SERVER);
});
