import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "doy14nwx0";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET ?? "taphoa_unsigned";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const IMAGE_FOLDERS = [
  { dir: path.join(__dirname, "../public/categories"), folder: "taphoa/categories" },
  { dir: path.join(__dirname, "../public/products"), folder: "taphoa/products" },
];

async function uploadImage(filePath, folder) {
  const filename = path.basename(filePath, path.extname(filePath));
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "image/jpeg" });

  const form = new FormData();
  form.append("file", blob, path.basename(filePath));
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", folder);
  form.append("public_id", filename);

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed for ${filename}: ${err}`);
  }
  const data = await res.json();
  return { filename, public_id: data.public_id, url: data.secure_url };
}

async function main() {
  const results = [];
  let failed = 0;

  for (const { dir, folder } of IMAGE_FOLDERS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    console.log(`\nUploading ${files.length} files from ${path.relative(process.cwd(), dir)}...`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      process.stdout.write(`  → ${file} ... `);
      try {
        const result = await uploadImage(filePath, folder);
        results.push(result);
        console.log(`OK`);
        console.log(`     URL: ${result.url}`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Done: ${results.length} uploaded, ${failed} failed`);

  if (results.length > 0) {
    const outputPath = path.join(__dirname, "cloudinary-urls.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nURLs saved to: scripts/cloudinary-urls.json`);
  }
}

main().catch(console.error);
