import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const WEBP_PATH = "eto-pt3/assets/webp";

/**
 * Store WebP images in the Grist DigitalOcean Spaces bucket.
 */
async function main(): Promise<void> {
  const s3Client = new S3Client({
    endpoint: "https://nyc3.digitaloceanspaces.com/",
    forcePathStyle: false,
    region: "nyc3",
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    },
  });

  const webps = (
    await fs.readdir(path.resolve(__dirname, "../../interactive/public"), {
      recursive: true,
    })
  ).filter((file) => path.extname(file) === ".webp");

  for (const file of webps) {
    console.log(`Uploading ${file}`);

    const Body = await fs.readFile(
      path.resolve(__dirname, `../../interactive/public/${file}`),
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: "grist",
      Key: `${WEBP_PATH}/${file}`,
      Body,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${file}`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
}

main();
