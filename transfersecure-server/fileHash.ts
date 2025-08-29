import type { Multipart, MultipartFile } from "@fastify/multipart"
import crypto from "crypto"
import { DynamoDBClient, CreateTableCommand,ScalarAttributeType, BillingMode,KeyType  } from "@aws-sdk/client-dynamodb"


export async function generateFileHash(file: MultipartFile, algorithm: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);

    file.file
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });
}

export const dbclient = new DynamoDBClient({region: "us-east-1"});
// const input = { // CreateTableInput
//   AttributeDefinitions: [ // AttributeDefinitions // required
//      { // AttributeDefinition
//       AttributeName: "id", // required
//       AttributeType: ScalarAttributeType.S, // required
//     },
//     { // AttributeDefinition
//       AttributeName: "user_id", // required
//       AttributeType: ScalarAttributeType.S, // required
//     },
//     //  { // AttributeDefinition
//     //   AttributeName: "files", // required
//     //   AttributeType: "L", // required
//     // },

//      { // AttributeDefinition
//       AttributeName: "created_at", // required
//       AttributeType: ScalarAttributeType.S, // required
//     },
//   ],
//    KeySchema: [ // KeySchema // required
//     { // KeySchemaElement
//       AttributeName: "id", // required
//       KeyType: KeyType.HASH, // required
//     },
//      { // KeySchemaElement
//       AttributeName: "user_id", // required
//       KeyType: KeyType.HASH, // required
//     },
//         { // KeySchemaElement
//       AttributeName: "created_at", // required
//       KeyType: KeyType.HASH, // required
//     },
//   ],
//   TableName: "test", // required

//   BillingMode:BillingMode.PAY_PER_REQUEST,
//   // ProvisionedThroughput: {
//   //   ReadCapacityUnits: Number("long"), // required
//   //   WriteCapacityUnits: Number("long"), // required
//   // },
//   // StreamSpecification: { // StreamSpecification
//   //   StreamEnabled: true || false, // required
//   //   StreamViewType: "NEW_AND_OLD_IMAGES" ,
//   // },
//   // SSESpecification: { // SSESpecification
//   //   Enabled:  false,
//   //   SSEType: "AES256" ,
//   //   KMSMasterKeyId: "STRING_VALUE",
//   // },
//   // Tags: [ // TagList
//   //   { // Tag
//   //     Key: "STRING_VALUE", // required
//   //     Value: "STRING_VALUE", // required
//   //   },
//   // ],
//   // TableClass: "STANDARD" ,
//   // DeletionProtectionEnabled: true || false,
//   // WarmThroughput: {
//   //   ReadUnitsPerSecond: Number("long"),
//   //   WriteUnitsPerSecond: Number("long"),
//   // },
//   // ResourcePolicy: "STRING_VALUE",
//   // OnDemandThroughput: {
//   //   MaxReadRequestUnits: Number("long"),
//   //   MaxWriteRequestUnits: Number("long"),
//   // },
// };
// const command = new CreateTableCommand(input);
// export const createTable = await dbclient.send(command);