import {defineStorage} from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'securefile-transfer',
   access: (allow) => ({
    '/*': [
      allow.guest.to(['read', 'write', 'delete'])
    ],
  })
});

// import { S3Client } from "@aws-sdk/client-s3";

// const s3Client = new S3Client({
//   region: "us-east-1", // your S3 region
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// export default s3Client;