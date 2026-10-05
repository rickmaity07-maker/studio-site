import { CATEGORIES, type Project, type ProjectCategory } from "@/data/projects";

/** A project as stored in Postgres / edited in the admin portal. */
export type StoredProject = Project & {
  id: string;
  order: number;
  published: boolean;
};

export type ProjectInput = Omit<StoredProject, "id" | "order">;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ID_RE = /^[a-z0-9]{20,40}$/;

export function imageUrl(id: string) {
  return `/api/images/${id}`;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateProject(
  raw: Record<string, unknown>
): { ok: true; value: ProjectInput } | { ok: false; error: string } {
  const stack = Array.isArray(raw.stack)
    ? raw.stack.map((s) => str(s, 40)).filter(Boolean).slice(0, 12)
    : [];

  const value: ProjectInput = {
    slug: str(raw.slug, 60),
    name: str(raw.name, 80),
    tagline: str(raw.tagline, 120),
    category: str(raw.category, 40) as ProjectCategory,
    year: str(raw.year, 4),
    stack,
    description: str(raw.description, 1200),
    accent: str(raw.accent, 7),
    embeddable: raw.embeddable !== false,
    featured: raw.featured === true,
    published: raw.published === true
  };

  const liveUrl = str(raw.liveUrl, 300);
  if (liveUrl) {
    try {
      const u = new URL(liveUrl);
      if (u.protocol !== "https:") return { ok: false, error: "Live URL must start with https://" };
    } catch {
      return { ok: false, error: "Live URL isn't a valid URL." };
    }
    value.liveUrl = liveUrl;
  }

  // Only images uploaded through the admin portal can be attached.
  const image = raw.image as { id?: unknown } | null | undefined;
  if (image && image.id !== undefined) {
    if (typeof image.id !== "string" || !ID_RE.test(image.id))
      return { ok: false, error: "Image must be uploaded through the admin portal." };
    value.image = { id: image.id, url: imageUrl(image.id) };
  }

  if (!value.name) return { ok: false, error: "Name is required." };
  if (!SLUG_RE.test(value.slug))
    return { ok: false, error: "Slug can only use lowercase letters, numbers and dashes." };
  if (!value.tagline) return { ok: false, error: "Tagline is required." };
  if (!CATEGORIES.includes(value.category)) return { ok: false, error: "Choose a category." };
  if (!/^\d{4}$/.test(value.year)) return { ok: false, error: "Year must be four digits." };
  if (!value.description) return { ok: false, error: "Description is required." };
  if (!HEX_RE.test(value.accent)) return { ok: false, error: "Accent must be a hex color like #D4AF37." };

  return { ok: true, value };
}
