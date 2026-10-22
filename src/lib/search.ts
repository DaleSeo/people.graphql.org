import type { Entry } from "./directory";

export function matchesSearch(person: Entry, search: string): boolean {
  const terms = search.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const username = person.githubUsername?.toLocaleLowerCase() ?? "";
  const fields = [
    person.name,
    person.location,
    person.organization,
    ...person.memberships.map((membership) => membership.label),
    ...person.articles.map((article) => article.title),
  ].map((value) => value?.toLocaleLowerCase() ?? "");
  return terms.every(
    (term) =>
      username.includes(term) ||
      fields.some((text) =>
        [...text.matchAll(/[\p{L}\p{N}_]+/gu)].some((word) =>
          text.startsWith(term, word.index),
        ),
      ),
  );
}
