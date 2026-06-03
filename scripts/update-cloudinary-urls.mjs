import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE = "https://taphoa-api-dev.onrender.com/api/v1";
const EMAIL    = "admin@taphoa.com";
const PASSWORD = "TapHoa@2025";

// Build a map: filename (no ext) → full Cloudinary URL
const cloudinaryUrls = JSON.parse(
  readFileSync(path.join(__dirname, "cloudinary-urls.json"), "utf-8")
);
const urlMap = Object.fromEntries(
  cloudinaryUrls.map((e) => [e.filename, e.url])
);

function extractFilename(url) {
  if (!url) return null;
  const base = url.split("/").pop(); // "xa-lach.jpg"
  return base.replace(/\.[^.]+$/, ""); // "xa-lach"
}

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const data = await res.json();
  return data.accessToken;
}

async function updateProducts(token) {
  let page = 1;
  const pageSize = 50;
  let updated = 0, skipped = 0, noMatch = 0;

  while (true) {
    const res = await fetch(`${API_BASE}/products?page=${page}&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GET products failed: ${await res.text()}`);
    const data = await res.json();
    const products = data.items ?? [];
    if (products.length === 0) break;

    for (const p of products) {
      const filename = extractFilename(p.thumbnailUrl);
      const newUrl = filename ? urlMap[filename] : null;

      if (!newUrl) {
        console.log(`  [SKIP] ${p.name} — không tìm thấy ảnh Cloudinary (${p.thumbnailUrl ?? "null"})`);
        noMatch++;
        continue;
      }

      if (p.thumbnailUrl === newUrl) {
        skipped++;
        continue;
      }

      const putRes = await fetch(`${API_BASE}/products/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: p.name,
          description: p.description ?? "",
          price: p.price,
          discountPrice: p.discountPrice ?? null,
          stock: p.stock,
          thumbnailUrl: newUrl,
          images: p.images ?? [],
          categoryId: p.categoryId,
        }),
      });

      if (putRes.ok) {
        console.log(`  [OK] ${p.name}`);
        console.log(`       ${newUrl}`);
        updated++;
      } else {
        console.log(`  [ERR] ${p.name}: ${await putRes.text()}`);
      }
    }

    if (products.length < pageSize) break;
    page++;
  }

  console.log(`\nProducts: ${updated} updated, ${skipped} already OK, ${noMatch} no match`);
}

async function updateCategories(token) {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET categories failed: ${await res.text()}`);
  const categories = await res.json();

  let updated = 0, skipped = 0, noMatch = 0;

  // Flatten all categories including children
  const all = [];
  for (const cat of categories) {
    all.push(cat);
    if (cat.children) all.push(...cat.children);
  }

  for (const cat of all) {
    const filename = extractFilename(cat.imageUrl);
    const newUrl = filename ? urlMap[filename] : null;

    if (!newUrl) {
      console.log(`  [SKIP] ${cat.name} — không tìm thấy ảnh Cloudinary (${cat.imageUrl ?? "null"})`);
      noMatch++;
      continue;
    }

    if (cat.imageUrl === newUrl) {
      skipped++;
      continue;
    }

    const putRes = await fetch(`${API_BASE}/categories/${cat.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cat.name,
        description: cat.description ?? "",
        imageUrl: newUrl,
      }),
    });

    if (putRes.ok) {
      console.log(`  [OK] ${cat.name}`);
      console.log(`       ${newUrl}`);
      updated++;
    } else {
      console.log(`  [ERR] ${cat.name}: ${await putRes.text()}`);
    }
  }

  console.log(`\nCategories: ${updated} updated, ${skipped} already OK, ${noMatch} no match`);
}

async function main() {
  console.log("Đăng nhập...");
  const token = await login();
  console.log("OK\n");

  console.log("── Cập nhật Categories ──────────────────────");
  await updateCategories(token);

  console.log("\n── Cập nhật Products ────────────────────────");
  await updateProducts(token);

  console.log("\nHoàn thành!");
}

main().catch(console.error);
