import settings from "../content/settings.json";

export type Settings = typeof settings;

type Json = Record<string, unknown>;

/** Remove keys whose value is empty string, null, undefined, or empty array. */
function compact<T extends Json>(obj: T): T {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

/** Resolve a possibly-relative path to an absolute URL using the site origin. */
function absolute(url: string, site: URL | string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return new URL(url, site).href;
}

/** Strip HTML tags from rich-text bio for plain-text Person.description. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function orgId(siteUrl: string) {
  return `${siteUrl.replace(/\/$/, "")}/#organization`;
}
export function businessId(siteUrl: string) {
  return `${siteUrl.replace(/\/$/, "")}/#business`;
}
export function websiteId(siteUrl: string) {
  return `${siteUrl.replace(/\/$/, "")}/#website`;
}

export function buildOrganization(s: Settings, siteUrl: string) {
  const o = s.organization;
  return compact({
    "@type": "Organization",
    "@id": orgId(siteUrl),
    name: o.legalName,
    url: siteUrl,
    description: o.description,
    foundingDate: o.foundingDate,
    logo: o.logo ? absolute(o.logo, siteUrl) : "",
    email: o.email,
    telephone: o.telephone,
    sameAs: (o.sameAs ?? []).filter(Boolean),
  });
}

export function buildProfessionalService(s: Settings, siteUrl: string) {
  const o = s.organization;
  const svc = s.service;
  const hasContact = (o.email && o.email.trim()) || (o.telephone && o.telephone.trim());
  const contactPoint = hasContact
    ? compact({
        "@type": "ContactPoint",
        contactType: "customer service",
        email: o.email,
        telephone: o.telephone,
        areaServed: svc.areaServed,
      })
    : undefined;
  return compact({
    "@type": "ProfessionalService",
    "@id": businessId(siteUrl),
    name: o.legalName,
    url: siteUrl,
    description: o.description,
    parentOrganization: { "@id": orgId(siteUrl) },
    provider: { "@id": orgId(siteUrl) },
    serviceType: svc.serviceType,
    areaServed: svc.areaServed,
    knowsAbout: (svc.knowsAbout ?? []).filter(Boolean),
    contactPoint,
  });
}

export function buildWebSite(s: Settings, siteUrl: string) {
  return compact({
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: s.organization.legalName,
    url: siteUrl,
    publisher: { "@id": orgId(siteUrl) },
  });
}

export function buildWebPage(args: {
  url: string;
  name: string;
  description?: string;
  siteUrl: string;
}) {
  return compact({
    "@type": "WebPage",
    "@id": `${args.url}#webpage`,
    url: args.url,
    name: args.name,
    description: args.description,
    isPartOf: { "@id": websiteId(args.siteUrl) },
    about: { "@id": orgId(args.siteUrl) },
  });
}

export function buildBreadcrumbs(items: { name: string; url: string }[]) {
  if (items.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildPerson(
  person: { name: string; bio?: string; image?: string },
  pageUrl: string,
  siteUrl: string,
  anchor: string,
) {
  return compact({
    "@type": "Person",
    name: person.name,
    description: person.bio ? stripHtml(person.bio) : "",
    image: person.image ? absolute(person.image, siteUrl) : "",
    url: `${pageUrl}#${anchor}`,
    worksFor: { "@id": orgId(siteUrl) },
  });
}

export function buildGraph(nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

export { settings };
