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

export async function calculateFutureDateTime(numberOfDays: number): Promise<Date> {
  const now = new Date(); // Get the current date and time
  now.setDate(now.getDate() + numberOfDays); // Add the specified number of days
  return now; // Return the new Date object
}
