import { promises as fs } from "fs";
import path from "path";
import { defaultCmsContent, type CmsContent } from "@/lib/cms-data";
import { normalizeCmsContent } from "@/lib/cms-normalize";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "cms-content.json");

export async function readCmsContentFromDisk(): Promise<CmsContent> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return normalizeCmsContent(JSON.parse(raw) as Partial<CmsContent>);
  } catch {
    const seeded = defaultCmsContent;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

export async function writeCmsContentToDisk(content: CmsContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), "utf-8");
}
