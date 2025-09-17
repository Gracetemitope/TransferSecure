import fastify, {} from 'fastify';
import { tmpName } from "tmp-promise";
import { autoSignIn, cognitoUserPoolsTokenProvider, confirmResetPassword, confirmSignIn, confirmSignUp, deleteUser, fetchUserAttributes, getCurrentUser, resendSignUpCode, resetPassword, signOut, updatePassword, updateUserAttributes, } from 'aws-amplify/auth/cognito';
import { CookieStorage, defaultStorage } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signIn, signUp } from 'aws-amplify/auth';
import crypto, { createHash } from 'crypto';
import cors from '@fastify/cors';
import 'dotenv/config';
import multipart, {} from '@fastify/multipart';
import { calculateFutureDateTime, generateFileHash } from './fileHash.js';
import axios from 'axios';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, GetObjectCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import rateLimit from '@fastify/rate-limit';
import { Upload } from "@aws-sdk/lib-storage";
import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";
import { scanUrlWithVirusTotal } from './virusTotalService.js';
import { getVirusTotalApiKey } from './awsSecrets.js';
import { PassThrough } from 'stream';
// ssl certificate
// const options = {
//   https: {
//     key: fs.readFileSync('private.key'),
//     cert: fs.readFileSync('certificate.crt'),
//   }
// };
const s3Client = new S3Client({
    region: "us-east-1", // your S3 region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const dbclient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dbclient);
const server = fastify();
await server.register(cors, {
    origin: ['http://localhost:3000', "https://main.dw0t9e0p5k4fj.amplifyapp.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});
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
            userPoolClientId: process.env.CLIENT_ID,
            userPoolId: process.env.USER_POOL_ID,
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
                const attributes = await fetchUserAttributes();
                const tokens = {
                    accessToken: session.tokens?.accessToken,
                    idToken: session.tokens?.idToken,
                    userName: username,
                    userId: userId,
                };
                return reply.code(200).send({
                    success: true,
                    result: {
                        ...tokens,
                        firstName: attributes.given_name,
                        lastName: attributes.family_name,
                        zoneinfo: attributes.zoneinfo,
                        email: attributes.email,
                    },
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
    }
    catch (err) {
        reply.code(401).send({ error: err.message, success: false });
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
server.post('/delete-account', async (request, reply) => {
    try {
        await deleteUser();
        reply.code(200).send({ success: true });
    }
    catch (err) {
        reply.code(500).send({ error: err.message, success: false });
    }
});
// '''
// Secrets Manager
// '''
server.post("/scan", async (request, reply) => {
    try {
        const { url } = request.body;
        const result = await scanUrlWithVirusTotal(url);
        reply.code(200).send({ success: true, data: result });
    }
    catch (error) {
        reply.code(500).send({ error: error.message, success: false });
    }
});
server.get("/test-secret", async (req, res) => {
    try {
        const apiKey = await getVirusTotalApiKey();
        res.send({
            success: true,
            secretPreview: apiKey.slice(0, 4) + "****",
        });
    }
    catch (err) {
        console.error("Error fetching secret:", err);
        res.status(500).send({ success: false, error: "Failed to fetch secret" });
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
        let duration;
        let fileName;
        const results = [];
        for await (const part of parts) {
            if (part.type === "field") {
                if (part.fieldname === "email")
                    email = part.value;
                if (part.fieldname === "duration") {
                    duration = (await calculateFutureDateTime(parseInt(part.value))).toLocaleString();
                }
                if (part.fieldname === "filename")
                    fileName = part.value;
            }
            if (part.type === "file") {
                // 1️⃣ Save file to temp and calculate SHA-256
                const tempFile = await tmpName();
                const hash = createHash("sha256");
                let totalBytes = 0;
                const writeStream = fs.createWriteStream(tempFile);
                for await (const chunk of part.file) {
                    hash.update(chunk);
                    totalBytes += chunk.length;
                    writeStream.write(chunk);
                }
                writeStream.end();
                const sha256 = hash.digest("hex");
                // 2️⃣ Check VirusTotal
                const vtRes = await axios
                    .get(`https://www.virustotal.com/api/v3/files/${sha256}`, {
                    headers: { "x-apikey": process.env.VIRUS_TOTAL },
                })
                    .catch((err) => err.response);
                const isMalicious = vtRes?.status !== 404 &&
                    vtRes?.data?.attributes?.last_analysis_stats?.malicious > 0;
                if (isMalicious) {
                    results.push({ filename: part.filename, malicious: true });
                    fs.unlinkSync(tempFile);
                    continue; // skip uploading
                }
                // 3️⃣ Multipart upload to S3
                const fileKey = `${Date.now()}-${part.filename}`;
                const createCmd = new CreateMultipartUploadCommand({
                    Bucket: "securefile-transfer3c92a-dev",
                    Key: fileKey,
                });
                const createRes = await s3Client.send(createCmd);
                const uploadId = createRes.UploadId;
                const uploadParts = [];
                const partSize = 5 * 1024 * 1024; // 5MB
                let partNumber = 1;
                const fileStream = fs.createReadStream(tempFile, { highWaterMark: partSize });
                let buffer = [];
                for await (const chunk of fileStream) {
                    buffer.push(chunk);
                    const size = Buffer.concat(buffer).length;
                    // Ensuring the size of the part is not more than 5mb
                    if (size >= partSize) {
                        const partBuffer = Buffer.concat(buffer);
                        const uploadPartCmd = new UploadPartCommand({
                            Bucket: "securefile-transfer3c92a-dev",
                            Key: fileKey,
                            UploadId: uploadId,
                            PartNumber: partNumber,
                            Body: partBuffer,
                        });
                        // Upload part
                        const uploadRes = await s3Client.send(uploadPartCmd);
                        // Store the part tag to an array
                        uploadParts.push({ ETag: uploadRes.ETag, PartNumber: partNumber });
                        partNumber++;
                        buffer = [];
                    }
                }
                // Upload remaining buffer
                if (buffer.length > 0) {
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
                // Complete upload
                await s3Client.send(new CompleteMultipartUploadCommand({
                    Bucket: "securefile-transfer3c92a-dev",
                    Key: fileKey,
                    UploadId: uploadId,
                    MultipartUpload: { Parts: uploadParts },
                }));
                // Generate download URL
                const command1 = new GetObjectCommand({ Bucket: "securefile-transfer3c92a-dev", Key: fileKey });
                const downloadUrl = await getSignedUrl(s3Client, command1, { expiresIn: 604800 });
                // Push non malicious file
                results.push({ filename: part.filename, url: downloadUrl, malicious: false, size: (totalBytes / 1024 / 1024).toFixed(2) });
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
                    duration,
                    email,
                },
            });
            await docClient.send(dbCommand).then(() => {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: email, // Change to your recipient
                    from: process.env.SENDER_EMAIL, // Change to your verified sender
                    subject: 'File shared',
                    text: `A file has been shared with you: ${cleanFiles[0].url}`,
                    html: `<strong>A file has been shared with you \n 
            
            File link \n
            ${cleanFiles[0].url}</strong>`,
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
    // createTable
    console.log(`Server listening at ${address}`);
    console.log(process.env.SERVER);
});
//# sourceMappingURL=index.js.map