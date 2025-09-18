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

import { DateTime } from "luxon";

export function normalizeDate(input: string) {

  try {
    let dt;

    // Try MM/DD/YYYY
    dt = DateTime.fromFormat(input, "M/d/yyyy, h:mm:ss a", { zone: "utc" });
    if (dt.isValid) return dt.toJSDate();

    // Try DD/MM/YYYY
    dt = DateTime.fromFormat(input, "d/M/yyyy, h:mm:ss a", { zone: "utc" });
    if (dt.isValid) return dt.toJSDate();
    
  } catch (error) {
    console.error(error)
  }
  

}