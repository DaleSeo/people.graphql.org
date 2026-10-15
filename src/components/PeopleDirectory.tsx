import Avatar from "./Avatar";
import { useEffect, useState, useRef, type CSSProperties } from "react";
import type { DirectoryPage, Entry, Mode } from "../lib/directory";
import styles from "./PeopleDirectory.module.css";
import starCardStyles from "../styles/star-card.module.css";

interface Props {
  page: DirectoryPage;
  entries: Entry[];
  categories: { top: DirectoryPage[]; sub: DirectoryPage[] };
}
const labels: Record<string, string> = {
  stories: "Stories",
  stars: "Stars",
  wg: "Working groups",
  ambassadors: "Ambassadors",
  speakers: "Speakers",
};
const url = (slug: string) => (slug ? `/${slug}/` : "/");
export default function PeopleDirectory({ page, entries, categories }: Props) {
  const [mode, setMode] = useState<Mode>(page.mode);
  const [search, setSearch] = useState("");
  const [explicitMode, setExplicitMode] = useState(false);
  const isStars = page.slug === "stars" || page.slug.startsWith("stars/");
  const [selectedStar, setSelectedStar] = useState<Entry | null>(null);
  const starDialog = useRef<HTMLDialogElement>(null);
  const selectedMembership =
    selectedStar?.memberships.find((m) => m.page === page.slug) ??
    selectedStar?.memberships
      .filter((m) => m.page.startsWith("stars/"))
      .toSorted((a, b) => b.page.localeCompare(a.page))[0];
  useEffect(() => {
    if (selectedStar && starDialog.current && !starDialog.current.open)
      starDialog.current.showModal();
  }, [selectedStar]);
  const isStories = page.slug === "stories";
  const hasArticles = entries.some((p) => p.articles.length);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("view");
    if (
      requested === "grid" ||
      (requested === "list" && !isStories) ||
      (requested === "article" && hasArticles)
    ) {
      setMode(requested);
      setExplicitMode(true);
    }
    setSearch(params.get("q") ?? "");
  }, [hasArticles, isStories]);
  function changeMode(next: Mode) {
    setMode(next);
    setExplicitMode(true);
    const current = new URL(location.href);
    current.searchParams.set("view", next);
    history.replaceState(null, "", current);
  }
  useEffect(() => {
    for (const link of document.querySelectorAll<HTMLAnchorElement>(
      "[data-directory-link]",
    )) {
      const target = new URL(link.href);
      if (
        explicitMode &&
        mode !== "article" &&
        !(mode === "list" && target.pathname === "/stories/")
      )
        target.searchParams.set("view", mode);
      else target.searchParams.delete("view");
      link.href = target.href;
    }
  }, [mode, explicitMode]);
  const query = search.trim().toLocaleLowerCase();
  const visible = entries.filter(
    (p) =>
      (mode !== "article" || p.articles.length > 0) &&
      [
        p.name,
        p.githubUsername,
        p.location,
        p.organization,
        ...p.memberships.map((m) => m.label),
        ...p.articles.map((a) => a.title),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
  );
  if (mode === "article" && (isStories || page.slug === "")) {
    const latestPublication = (person: Entry) =>
      Math.max(
        ...person.articles.map((article) => Date.parse(article.publishedAt)),
      );
    visible.sort(
      (a, b) =>
        latestPublication(b) - latestPublication(a) ||
        a.name.localeCompare(b.name, "en"),
    );
  }
  const active = visible.filter((p) => p.active),
    previous = visible.filter((p) => !p.active);
  const activeTitle = (() => {
    const count = active.length;
    if (page.slug === "wg/tsc") return `${count} TSC`;
    if (page.slug === "ambassadors")
      return `${count} ${count === 1 ? "Ambassador" : "Ambassadors"}`;
    if (page.slug === "wg" || page.slug.startsWith("wg/"))
      return `${count} active ${count === 1 ? "member" : "members"}`;
    if (page.slug === "stories") {
      const stories = new Set(
        active.flatMap((person) =>
          person.articles.map((article) => article.href),
        ),
      ).size;
      return `${stories} ${stories === 1 ? "story" : "stories"}`;
    }
    if (page.slug === "stars" || page.slug.startsWith("stars/"))
      return `${count} ${count === 1 ? "star" : "stars"}`;
    if (page.slug === "speakers" || page.slug.startsWith("speakers/"))
      return `${count} ${count === 1 ? "speaker" : "speakers"}`;
    return `${count} ${count === 1 ? "person" : "people"} to discover`;
  })();
  const previousTitle =
    page.slug === "wg/tsc" || page.slug === "ambassadors"
      ? `${previous.length} Emeriti`
      : page.slug === "wg" || page.slug.startsWith("wg/")
        ? `${previous.length} older ${previous.length === 1 ? "member" : "members"}`
        : `${previous.length} previously active ${previous.length === 1 ? "person" : "people"}`;
  function filterHref(slug: string) {
    return (
      url(slug) + (explicitMode && mode !== "article" ? `?view=${mode}` : "")
    );
  }
  const isWorkingGroup = page.slug === "wg" || page.slug.startsWith("wg/");
  function renderPerson(p: Entry) {
    const profile = `/profiles/${p.slug}/`;
    const ambassadorList = page.slug === "ambassadors" && mode === "list";
    const ambassador = p.memberships.find((m) => m.page === "ambassadors");
    const featuredStories =
      mode === "list" &&
      !isStories &&
      p.featuredStories.map((story) => (
        <h4 className={styles.featuredStory} key={story.href}>
          <a href={story.href}>Featured story: {story.title}</a>
        </h4>
      ));
    const ambassadorRoles = [
      ...p.localNames.map((local) => `${local} organizer`),
      ...(ambassador?.maintainerProjects ?? []).map(
        (project) => `${project} maintainer`,
      ),
    ];
    const meetings = p.count
      ? `${p.count} meeting${p.count === 1 ? "" : "s"} attended`
      : undefined;
    const context = [...new Set(p.memberships.map((m) => m.label))];
    const lastAttended = p.memberships
      .map((m) => m.lastActive ?? "")
      .sort()
      .at(-1);
    const groups = [
      ...new Map(
        p.memberships
          .filter((m) => m.page.startsWith("wg/"))
          .map((m) => [m.page, m]),
      ).values(),
    ];
    return (
      <li key={p.slug} id={p.anchor} className={styles.person}>
        <a
          href={profile}
          className={`${styles.avatar} ${p.currentTsc ? styles.gold : p.currentAmbassador ? styles.ambassador : ""}`}
          aria-label={
            isStars ? `View star card for ${p.name}` : `Meet ${p.name}`
          }
          aria-haspopup={isStars ? "dialog" : undefined}
          onClick={
            isStars
              ? (event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  event.preventDefault();
                  setSelectedStar(p);
                }
              : undefined
          }
          title={p.name}
          style={{ viewTransitionName: p.transitionName } as CSSProperties}
        >
          <Avatar name={p.name} src={p.avatarUrl} />
        </a>
        <div className={styles.details}>
          <div className={styles.identity}>
            <h3>
              <a href={profile}>{p.name}</a>
            </h3>
            {p.githubUsername && (
              <span className={styles.username}>@{p.githubUsername}</span>
            )}
          </div>
          {mode !== "article" && isWorkingGroup && (
            <>
              <div className={styles.memberMeta}>
                {p.location && <span>{p.location}</span>}
                {meetings && <span>{meetings}</span>}
                {lastAttended && (
                  <span>
                    Last attended{" "}
                    <time dateTime={lastAttended}>{lastAttended}</time>
                  </span>
                )}
                {p.memberships.some((m) => m.chair) && <span>TSC chair</span>}
                {p.memberships
                  .filter((m) => m.affiliation)
                  .map((m) => (
                    <span key={m.page}>
                      {m.affiliation}
                      {m.emeriti ? " (during term)" : ""}
                    </span>
                  ))}
                <a href={profile}>View profile ↗</a>
              </div>
              {featuredStories}
              {page.slug === "wg" && (
                <ul
                  className={styles.groupLinks}
                  aria-label={`${p.name}'s working groups`}
                >
                  {groups.map((m) => (
                    <li key={m.page}>
                      <a href={`${url(m.page)}#${p.anchor}`}>
                        {m.page === "wg/tsc"
                          ? "TSC"
                          : m.label.replace(/ WG$/, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {mode !== "article" && !isWorkingGroup && (
            <>
              {p.location && <p className={styles.location}>{p.location}</p>}
              {featuredStories}
              {ambassadorList ? (
                <>
                  {ambassadorRoles.length > 0 && (
                    <ul
                      className={styles.ambassadorRoles}
                      aria-label="Community roles"
                    >
                      {ambassadorRoles.map((role) => (
                        <li key={role}>{role}</li>
                      ))}
                    </ul>
                  )}
                  {!ambassador?.emeriti && !!ambassador?.interests?.length && (
                    <p className={styles.context}>
                      Ask me about {ambassador.interests.join(", ")}.
                    </p>
                  )}
                </>
              ) : (
                <p className={styles.context}>
                  {meetings ?? context.slice(0, 3).join(" · ")}
                  {!meetings && context.length > 3
                    ? ` · +${context.length - 3} more`
                    : ""}
                </p>
              )}
              {p.memberships.some((m) => m.chair) && (
                <p className={styles.context}>TSC chair</p>
              )}
              {p.memberships
                .filter((m) => m.affiliation)
                .map((m) => (
                  <p key={m.page} className={styles.location}>
                    {m.affiliation}
                    {m.emeriti ? " · affiliation during term" : ""}
                  </p>
                ))}
              {p.memberships.filter((m) => m.lastActive).length > 0 && (
                <p className={styles.location}>
                  Last attended:{" "}
                  {p.memberships
                    .map((m) => m.lastActive ?? "")
                    .sort()
                    .at(-1)}
                </p>
              )}
              {p.memberships
                .flatMap((m) => (m.talk ? [m.talk] : []))
                .map((t) => (
                  <p className={styles.talk} key={t.id}>
                    <a href={`${profile}#talk-${t.id}`}>
                      {t.title} <span aria-hidden="true">↗</span>
                    </a>
                  </p>
                ))}
              <a className={styles.profileLink} href={profile}>
                View profile <span aria-hidden="true">↗</span>
              </a>
            </>
          )}
          {mode === "article" &&
            [...p.articles]
              .sort(
                (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
              )
              .map((a) => (
                <div className={styles.article} key={a.href}>
                  <p className={styles.date}>
                    <time dateTime={a.publishedAt}>
                      {new Date(a.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  </p>
                  <h2>
                    <a href={a.href}>{a.title}</a>
                  </h2>
                  <p>{a.description}</p>
                  <a className={styles.profileLink} href={a.href}>
                    Read the story <span aria-hidden="true">↗</span>
                  </a>
                </div>
              ))}
        </div>
      </li>
    );
  }
  return (
    <div className={styles.directory}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {categories.sub.length > 0 && (
            <nav
              className={styles.subcategories}
              aria-label={`${labels[page.slug.split("/")[0]]} categories`}
            >
              <a
                href={filterHref(page.slug.split("/")[0])}
                aria-current={!page.parent ? "page" : undefined}
              >
                All
              </a>
              {categories.sub.map((p) => (
                <a
                  key={p.slug}
                  href={filterHref(p.slug)}
                  aria-current={page.slug === p.slug ? "page" : undefined}
                >
                  {p.slug.startsWith("stars/")
                    ? p.slug.split("/")[1]
                    : p.title
                        .replace(" Working Group", "")
                        .replace("Technical Steering Committee", "TSC")}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className={styles.searchGroup}>
          <label>
            <span className={styles.srOnly}>Search people</span>
            <input
              type="search"
              placeholder="Find a name or username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className={styles.viewToolbar}>
        <div className={styles.modes} role="group" aria-label="Display mode">
          {(
            [
              "grid",
              ...(!isStories ? ["list"] : []),
              ...(hasArticles ? ["article"] : []),
            ] as Mode[]
          ).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
            >
              {value === "grid"
                ? "▦ Grid"
                : value === "list"
                  ? "☰ List"
                  : "Articles"}
            </button>
          ))}
        </div>
      </div>
      <div data-view={mode} className={styles.results}>
        <section aria-label="Active people">
          <h2 className={styles.sectionTitle} aria-live="polite">
            {activeTitle}
          </h2>
          {active.length > 0 && (
            <ul className={styles.people}>{active.map(renderPerson)}</ul>
          )}
        </section>
        {previous.length > 0 && (
          <section
            aria-label="Previously active people"
            className={styles.previous}
          >
            <h2 className={styles.sectionTitle}>{previousTitle}</h2>
            <p className={styles.previousIntro}>
              Recognizing the people whose participation helped shape this
              community.
            </p>
            <ul className={styles.people}>{previous.map(renderPerson)}</ul>
          </section>
        )}
        {visible.length === 0 && (
          <p className={styles.empty}>
            No people match your search. Try another name or username.
          </p>
        )}
      </div>
      {isStars && (
        <dialog
          ref={starDialog}
          className={styles.starDialog}
          aria-labelledby="star-dialog-name"
          onClose={() => setSelectedStar(null)}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              event.currentTarget.close();
          }}
        >
          <button
            className={styles.dialogClose}
            type="button"
            aria-label="Close star card"
            autoFocus
            onClick={() => starDialog.current?.close()}
          >
            ×
          </button>
          {selectedStar && (
            <>
              <div className={styles.dialogHeading}>
                <p className={styles.date}>
                  GRAPHQL STARS · {selectedMembership?.label}
                </p>
                <div className={styles.identity}>
                  <h2 id="star-dialog-name">{selectedStar.name}</h2>
                  {selectedStar.githubUsername && (
                    <a
                      href={`https://github.com/${selectedStar.githubUsername}`}
                    >
                      @{selectedStar.githubUsername} ↗
                    </a>
                  )}
                </div>
              </div>
              <a
                className={styles.profileLink}
                href={`/profiles/${selectedStar.slug}/`}
              >
                View full profile <span aria-hidden="true">↗</span>
              </a>
              <p>
                Thank you {selectedStar.githubUsername ?? selectedStar.name} for
                being a Star in {selectedMembership?.page.split("/")[1]}!
              </p>
              {selectedMembership?.image && (
                <figure className={styles.starCard}>
                  <img
                    className={starCardStyles.card}
                    src={selectedMembership.image}
                    alt={`GraphQL Stars contribution card for ${selectedStar.name}, ${selectedMembership.label}`}
                  />
                </figure>
              )}
            </>
          )}
        </dialog>
      )}
    </div>
  );
}
