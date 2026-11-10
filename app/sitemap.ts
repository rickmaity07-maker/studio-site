import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/server/projects";
import { site } from "@/data/site";
import { SECTORS } from "@/data/sectors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages = ["", "/work", "/for", "/features", "/pricing", "/estimate", "/faq", "/app", "/request", "/privacy", "/impressum"];
  return [
    ...pages.map((path) => ({ url: `${site.url}${path}` })),
    ...SECTORS.map((s) => ({ url: `${site.url}/for/${s.slug}` })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}` }))
  ];
}
