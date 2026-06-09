import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { stitch } from "@google/stitch-sdk";

const PROJECT_ID = "16183829837667648123";
const OUT_DIR = join(process.cwd(), "src");

function slugify(name, index) {
  const base =
    (name || `screen-${index + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `screen-${index + 1}`;
  return base;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  return res.text();
}

async function main() {
  if (!process.env.STITCH_API_KEY && !process.env.STITCH_ACCESS_TOKEN) {
    console.error(
      "Missing STITCH_API_KEY. Get one at https://stitch.withgoogle.com/settings"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const project = stitch.project(PROJECT_ID);
  const screens = await project.screens();

  if (!screens.length) {
    console.error("No screens found in this project.");
    process.exit(1);
  }

  console.log(`Found ${screens.length} screen(s)\n`);

  const manifest = [];

  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    const slug = slugify(screen.title ?? screen.name, i);
    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();

    if (!htmlUrl) {
      console.warn(`  ⚠ ${slug} — no HTML URL, skipping`);
      continue;
    }

    const html = await download(htmlUrl);

    const htmlPath = join(OUT_DIR, `${slug}.html`);
    await writeFile(htmlPath, html, "utf8");

    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        await writeFile(join(OUT_DIR, `${slug}.png`), buf);
      }
    }

    manifest.push({
      slug,
      title: screen.title ?? screen.name ?? slug,
      screenId: screen.screenId ?? screen.id,
      html: `src/${slug}.html`,
    });

    console.log(`  ✓ ${slug}`);
  }

  await writeFile(
    join(process.cwd(), "manifest.json"),
    JSON.stringify({ projectId: PROJECT_ID, screens: manifest }, null, 2),
    "utf8"
  );

  console.log("\nDone. HTML saved to src/");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
