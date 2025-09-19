import fastify, {} from 'fastify';
import { tmpName } from "tmp-promise";
import { autoSignIn, cognitoUserPoolsTokenProvider, confirmResetPassword, confirmSignIn, confirmSignUp, deleteUser, fetchUserAttributes, getCurrentUser, resendSignUpCode, resetPassword, signOut, updatePassword, updateUserAttributes, } from 'aws-amplify/auth/cognito';
import { CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand, ResendConfirmationCodeCommand, ChangePasswordCommand, UpdateUserAttributesCommand, GlobalSignOutCommand, DeleteUserCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CookieStorage, defaultStorage } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signUp } from 'aws-amplify/auth';
import crypto, { createHash } from 'crypto';
import cors from '@fastify/cors';
import 'dotenv/config';
import multipart, {} from '@fastify/multipart';
import { calculateFutureDateTime, generateFileHash, normalizeDate } from './fileHash.js';
import axios from 'axios';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, GetObjectCommand, DeleteObjectCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteItemCommand, DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import { CronJob } from 'cron';
import rateLimit from '@fastify/rate-limit';
import { Upload } from "@aws-sdk/lib-storage";
import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";
// import { scanUrlWithVirusTotal } from './virusTotalService.js';
// import { getVirusTotalApiKey } from './awsSecrets.js';
// import { PassThrough } from 'stream';
import { getSecrets } from './helper.js';
import { CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
// ssl certificate
// const options = {
//   https: {
//     key: fs.readFileSync('private.key'),
//     cert: fs.readFileSync('certificate.crt'),
//   }
// };
// async function main() {
const secrets = await getSecrets();
// console.log(secrets)
// const secrets = async ( ) => {
//    return await getSecrets()
// };
const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
});
const dbclient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dbclient, {
    marshallOptions: {
        removeUndefinedValues: true, // ✅ auto-remove undefined
    },
});
const server = fastify();
await server.register(cors, {
    origin: ['http://localhost:3000', "https://main.dw0t9e0p5k4fj.amplifyapp.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});
const job = new CronJob('0 12 * * *', // cronTime
async function () {
    // console.log('You will see this message every second');
    await updateFile();
}, // onTick
null, // onComplete
true, // start
'America/Los_Angeles' // timeZone
);
async function updateFile() {
    try {
        let lastKey = undefined;
        do {
            // Get all data stored in the files dynamodb
            const command = new ScanCommand({ TableName: "Files", ExclusiveStartKey: lastKey });
            const response = await docClient.send(command);
            // Check if there are any data returne
            if (response.Items && response.Items.length > 0) {
                for (const value of response.Items) {
                    let deadline;
                    // Check if a deadline was set then normalize the time format
                    if (value.duration?.S) {
                        const normDate = normalizeDate(value.duration?.S);
                        console.log(normDate);
                        deadline = normDate;
                    }
                    const now = new Date();
                    // Compare if the deadline date has expired if it is less the current date
                    if (now > deadline || !value.duration?.S) {
                        for (const file of value.files.L) {
                            // Get the url 
                            const url = new URL(file.M.url.S);
                            // get the pathname from the url
                            const pathname = url.pathname;
                            // Remove leading "/" and decode (in case of spaces or special chars)
                            const objectKey = decodeURIComponent(pathname.substring(1));
                            // Delete object in s3
                            const deleteCommand = new DeleteObjectCommand({
                                Bucket: "securefile-transfer3c92a-dev",
                                Key: objectKey,
                            });
                            await s3Client.send(deleteCommand);
                        }
                        // Delete the entry in the database
                        const command = new DeleteItemCommand({
                            TableName: "Files",
                            Key: {
                                id: { S: value.id.S }
                            }
                        });
                        await docClient.send(command);
                    }
                }
            }
            lastKey = response.LastEvaluatedKey;
        } while (lastKey);
    }
    catch (error) {
        console.error();
    }
}
await server.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute'
});
await server.register(multipart, { limits: {
        fileSize: 1024 * 1024 * 1024
    } });
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: secrets.CLIENT_ID,
            userPoolId: secrets.USER_POOL_ID,
            signUpVerificationMethod: 'code',
        },
    },
    Storage: {
        S3: {
            bucket: "securefile-transfer3c92a-dev",
            region: "us-east-1"
        }
    },
});
function generateUserName(email) {
    const raw = email.toLowerCase();
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}
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
                zoneinfo: { type: 'string', minLength: 2 },
            },
        },
    },
}, async (request, reply) => {
    const { firstName, lastName, email, password, zoneinfo } = request.body;
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
    }
    catch (err) {
        let message = 'Unknown error';
        console.log(err);
        if (err.name === 'UsernameExistsException') {
            message = 'Email already registered';
        }
        else if (err.name === 'InvalidPasswordException') {
            message = 'Password does not meet complexity requirements';
        }
        else if (err.name === 'CodeMismatchException') {
            message = 'Invalid verification code';
        }
        else if (err.name === 'ExpiredCodeException') {
            message = 'Verification code expired';
        }
        else {
            message = err.name;
        }
        reply.code(400).send({ success: false, error: err.message, details: message });
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
        return reply.code(200).send({
            success: true,
            message: result.isSignUpComplete ? 'User confirmed successfully.' : 'Further steps required.',
            data: { nextStep: result.nextStep?.signUpStep ?? 'DONE' },
        });
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
        reply.code(400).send({ code: err.name, error: message, success: false });
    }
});
server.post('/resend-confirmation', async (request, reply) => {
    const { email } = request.body;
    console.log(`Resending confirmation for ${email}`);
    try {
        const result = await resendSignUpCode({
            username: email,
        });
        reply.code(200).send({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error('Resend confirmation error:', JSON.stringify(err, null, 2));
        reply.code(400).send({ error: err.message, success: false });
    }
});
// server.post('/login', async (request, reply) => {
//     const { email, password, newPassword } = request.body as {
//         email: string;
//         password: string;
//         newPassword?: string;
//     };
//     try {
//         const result = await signIn({
//             username: email,
//             password: password,
//             options: {
//                 authFlowType: 'USER_PASSWORD_AUTH',
//             },
//         });
//         if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
//             if (!newPassword) {
//                 return reply.code(400).send({
//                     error: 'NEW_PASSWORD_REQUIRED',
//                     message: 'User must set a new password.',
//                 });
//             }
//             const confirmed = await confirmSignIn({
//                 challengeResponse: newPassword,
//             });
//             if (confirmed.isSignedIn) {
//                 const { username, userId } = await getCurrentUser();
//                 const session = await fetchAuthSession();
//                 const attributes = await fetchUserAttributes();
//                 const tokens = {
//                     accessToken: session.tokens?.accessToken,
//                     idToken: session.tokens?.idToken,
//                     userName: username,
//                     userId: userId,
//                 };
//                 return reply.code(200).send({
//                     success: true,
//                     result: {
//                         ...tokens,
//                         firstName: attributes.given_name,
//                         lastName: attributes.family_name,
//                         zoneinfo: attributes.zoneinfo,
//                         email: attributes.email,
//                     },
//                 });
//             }
//         }
//         if (result.isSignedIn) {
//             const { username, userId } = await getCurrentUser();
//             const session = await fetchAuthSession();
//             const tokens = {
//                 accessToken: session.tokens?.accessToken,
//                 idToken: session.tokens?.idToken,
//                 userName: username,
//                 userId: userId,
//             };
//             return reply.code(200).send({
//                 success: true,
//                 result: tokens,
//             });
//         }
//         return reply.code(400).send({
//             error: 'CHALLENGE_REQUIRED',
//             message: result.nextStep.signInStep,
//         });
//     } catch (err) {
//         reply.code(401).send({ error: (err as Error).message, success: false });
//     }
// });
server.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    try {
        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: secrets.CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });
        const response = await cognitoClient.send(command);
        if (response.AuthenticationResult) {
            const accessToken = response.AuthenticationResult.AccessToken;
            const idToken = response.AuthenticationResult.IdToken;
            const userResponse = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
            const attributes = {};
            userResponse.UserAttributes?.forEach(attr => {
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
            error: "CHALLENGE_REQUIRED",
            nextStep: response.ChallengeName,
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return reply.code(401).send({
            success: false,
            error: err.message,
        });
    }
});
server.put("/change-password", async (request, reply) => {
    const { oldPassword, newPassword, confirmNewPassword } = request.body;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return reply.code(400).send({
            success: false,
            error: "All fields are required",
        });
    }
    if (newPassword !== confirmNewPassword) {
        return reply.code(400).send({
            success: false,
            error: "New password and confirmation do not match",
        });
    }
    try {
        await updatePassword({
            oldPassword,
            newPassword,
        });
        return reply.code(200).send({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (err) {
        console.error("Error changing password:", err);
        return reply.code(400).send({
            success: false,
            error: err.message,
        });
    }
});
server.post("/update-profile", {
    schema: {
        body: {
            type: "object",
            required: ["firstName", "lastName", "zoneinfo"],
            properties: {
                firstName: { type: "string", minLength: 1 },
                lastName: { type: "string", minLength: 1 },
                zoneinfo: { type: "string", minLength: 2 },
            },
        },
    },
}, async (request, reply) => {
    const { firstName, lastName, zoneinfo } = request.body;
    try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        await updateUserAttributes({
            userAttributes: {
                given_name: firstName,
                family_name: lastName,
                zoneinfo: zoneinfo,
            },
        });
        reply.code(200).send({
            success: true,
            message: "Profile updated successfully",
            data: {
                userId: user.userId,
                username: user.username,
                email: attributes.email,
                firstName: firstName,
                lastName: lastName,
                zoneinfo: zoneinfo,
            },
        });
    }
    catch (err) {
        console.error("Error updating profile:", err);
        reply.code(400).send({
            success: false,
            error: err.message,
        });
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
    }
    catch (err) {
        reply.code(401).send({ error: err.message, success: false });
    }
});
server.delete('/delete-account', async (request, reply) => {
    try {
        await deleteUser();
        reply.code(200).send({ success: true });
    }
    catch (err) {
        reply.code(500).send({ error: err.message, success: false });
    }
});
// '''
// FILE OPERATIONS
// '''
// 
server.post('/file/:userId', async function (req, reply) {
    try {
        // ------------------------------
        // 1️⃣ Parse multipart form data
        // ------------------------------
        const parts = req.parts();
        const { userId } = req.params;
        let email;
        let sec;
        let duration;
        let fileName;
        const results = [];
        for await (const part of parts) {
            if (part.type === "field") {
                if (part.fieldname === "email")
                    email = part.value;
                if (part.fieldname === "duration") {
                    sec = parseInt(part.value);
                    duration = (await calculateFutureDateTime(sec)).toLocaleString();
                }
                if (part.fieldname === "filename")
                    fileName = part.value;
            }
            if (part.type === "file") {
                // Save file to temp and calculate SHA-256
                console.log(email);
                const tempFile = await tmpName();
                const hash = createHash("sha256");
                let totalBytes = 0;
                const writeStream = fs.createWriteStream(tempFile);
                // wait for each chunk of 
                for await (const chunk of part.file) {
                    // store pass each chunk to be hashed
                    hash.update(chunk);
                    // Track the size of the file in bytes
                    totalBytes += chunk.length;
                    // Write this chunk to the the temporary file
                    writeStream.write(chunk);
                }
                //Close the write stream
                writeStream.end();
                //At this point all the chunk has been streaed generate the sha256 hash
                const sha256 = hash.digest("hex");
                //Check VirusTotal if the hash is malicious
                const vtRes = await axios
                    .get(`https://www.virustotal.com/api/v3/files/${sha256}`, {
                    headers: { "x-apikey": secrets.VIRUS_TOTAL },
                })
                    .catch((err) => err.response);
                // Checking virustotal result
                const isMalicious = vtRes?.status !== 404 &&
                    vtRes?.data?.attributes?.last_analysis_stats?.malicious > 0;
                // If malicious unlink the tempFile created
                if (isMalicious) {
                    results.push({
                        filename: part.filename, malicious: true,
                        email: email
                    });
                    fs.unlinkSync(tempFile);
                    continue; // skip uploading
                }
                //Generate the file key for the s3
                const fileKey = `${Date.now()}-${part.filename}`;
                // Create A multipart upload instace with the file key this is where the part will be uploaded to
                const createCmd = new CreateMultipartUploadCommand({
                    Bucket: "securefile-transfer3c92a-dev",
                    Key: fileKey,
                });
                const createRes = await s3Client.send(createCmd);
                const uploadId = createRes.UploadId;
                const uploadParts = [];
                //This is the part size we are using to limit each part upload
                const partSize = 5 * 1024 * 1024; // 5MB
                let partNumber = 1;
                // Read the the temp file 
                const fileStream = fs.createReadStream(tempFile, { highWaterMark: partSize });
                let buffer = [];
                for await (const chunk of fileStream) {
                    buffer.push(chunk);
                    const size = Buffer.concat(buffer).length;
                    // Only upload when the chunk size is more than the limit part size
                    if (size >= partSize) {
                        const partBuffer = Buffer.concat(buffer);
                        const uploadPartCmd = new UploadPartCommand({
                            Bucket: "securefile-transfer3c92a-dev",
                            Key: fileKey,
                            UploadId: uploadId,
                            PartNumber: partNumber,
                            Body: partBuffer,
                        });
                        // Upload part to s3 and track with PartNumber and Upload Id
                        const uploadRes = await s3Client.send(uploadPartCmd);
                        // Store the part tag to an array
                        uploadParts.push({ ETag: uploadRes.ETag, PartNumber: partNumber });
                        //update the part number
                        partNumber++;
                        //Clear the chunk buffer
                        buffer = [];
                    }
                }
                // Upload remaining buffer if the chunk are less than 5mb
                if (buffer.length > 0) {
                    // Only upload when the chunk size is more than the limit part size
                    const partBuffer = Buffer.concat(buffer);
                    const uploadPartCmd = new UploadPartCommand({
                        Bucket: "securefile-transfer3c92a-dev",
                        Key: fileKey,
                        UploadId: uploadId,
                        PartNumber: partNumber,
                        Body: partBuffer,
                    });
                    const uploadRes = await s3Client.send(uploadPartCmd);
                    uploadParts.push({ ETag: uploadRes.ETag, PartNumber: partNumber });
                }
                // Complete upload by geting all the individual parts id  and number and merges the chunk into the original file in s3
                await s3Client.send(new CompleteMultipartUploadCommand({
                    Bucket: "securefile-transfer3c92a-dev",
                    Key: fileKey,
                    UploadId: uploadId,
                    MultipartUpload: { Parts: uploadParts },
                }));
                // Generate download URL
                const command1 = new GetObjectCommand({ Bucket: "securefile-transfer3c92a-dev", Key: fileKey });
                const expires = sec * 86400;
                const downloadUrl = await getSignedUrl(s3Client, command1, { expiresIn: expires });
                // Push non malicious file
                console.log(email);
                results.push({ filename: part.filename, url: downloadUrl, malicious: false, email: email, size: (totalBytes / 1024 / 1024).toFixed(2) });
                console.log(results);
                // Remove temp file
                fs.unlinkSync(tempFile);
            }
        }
        // Save metadata to DynamoDB if ther is any none malicious file
        const cleanFiles = results.filter((f) => !f.malicious);
        if (cleanFiles.length > 0) {
            const dbCommand = new PutCommand({
                TableName: "Files",
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
            await docClient.send(dbCommand).then(() => {
                // Send email to the reciever
                sgMail.setApiKey(secrets.SENDGRID_API_KEY);
                const encodedUrl = encodeURIComponent(cleanFiles[0].url);
                const finalUrl = `https://main.dw0t9e0p5k4fj.amplifyapp.com/download-file?download=${encodedUrl}`;
                const emailContent = `
                    <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>File Received Notification</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f6f6f6;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    font-size: 20px;
                }
                .content {
                    padding: 30px 20px;
                    color: #333333;
                    line-height: 1.5;
                }
                .content h2 {
                    color: #4CAF50;
                }
                .file-link {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    background-color: #f0f0f0;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                }
                @media (max-width: 600px) {
                    .container {
                    margin: 20px;
                    }
                }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="header">File Received</div>
                <div class="content">
                    <h2>Hello  </h2>
                    <p>You have successfully received a new file:</p>
                    <p><strong>File name: ${fileName}</strong></p>
                    <p>Click the button below to download your file:</p>
                    <a href="${finalUrl}" class="file-link">Download File</a>
                    <p>If you did not expect this file, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2025 Your Company. All rights reserved.
                </div>
                </div>
            </body>
            </html>            
                `;
                const msg = {
                    to: email, // Change to your recipient
                    from: secrets.SENDER_EMAIL, // Change to your verified sender
                    subject: 'File shared via TransferSecure',
                    text: emailContent,
                    html: emailContent,
                };
                sgMail
                    .send(msg)
                    .then(() => {
                    // console.log('Email sent')
                })
                    .catch((error) => {
                    console.error(error.response?.body);
                });
            });
        }
        return reply.code(200).send({ success: true, data: results });
    }
    catch (error) {
        reply.code(500).send({ error: error.message, success: false });
    }
});
server.get('/user/file/:userId', async function (req, reply) {
    try {
        // Get user Id as a request parameter
        const { userId } = req.params;
        // Get all files with the user iD attached to them
        const command = new QueryCommand({
            TableName: "Files",
            IndexName: "user_id-index",
            KeyConditionExpression: "user_id = :u",
            ExpressionAttributeValues: {
                ":u": { S: userId },
            },
        });
        // Execute command
        const response = await docClient.send(command);
        const userFiles = response.Items.map(item => unmarshall(item));
        // Count the files
        const fileCount = userFiles.length;
        // Reply with user file information
        reply.code(200).send({ data: userFiles, success: true, totalFiles: fileCount });
    }
    catch (error) {
        reply.code(500).send({ error: error.message, success: false });
    }
});
server.post('/forgot-password', async (request, reply) => {
    const { email, confirmationCode, newPassword } = request.body;
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
        }
        else {
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
    }
    catch (err) {
        return reply.code(500).send({ success: false, error: err.message });
    }
});
server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    job.start();
    // createTable
    console.log(`Server listening at ${address}`);
    console.log(secrets.SERVER);
});
// }
// main();
//# sourceMappingURL=index.js.map