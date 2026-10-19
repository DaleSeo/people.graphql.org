// Directory page wording, navigation actions and default views.
// Annual and working-group pages use the templates below.
const action = (label, href) => ({ label, href });

export const directoryPages = [
  {
    slug: "",
    breadcrumb: "People",
    title: "The people behind GraphQL.",
    description:
      "Meet the people building GraphQL, sharing what they know, and helping others find their place in the community.",
    action: {
      label: "Find your working group",
      href: "/wg/",
    },
    parent: "",
    mode: "grid",
  },
  {
    slug: "stories",
    breadcrumb: "Stories",
    title: "In their own words.",
    description:
      "How people found their way into GraphQL, what they’re working on, and what they’ve learned along the way.",
    action: {
      label: "About GraphQL Stories",
      href: "/stories/about/",
    },
    parent: "",
    mode: "article",
  },
  {
    slug: "stars",
    breadcrumb: "Stars",
    title: "A universe shaped by contributors.",
    description:
      "Celebrating the people recognized each year for their contributions to GraphQL’s open-source projects and specifications.",
    action: {
      label: "About GraphQL Stars",
      href: "/stars/about/",
    },
    parent: "",
    mode: "grid",
  },
  {
    slug: "wg",
    breadcrumb: "Working groups",
    title: "Building GraphQL together.",
    description:
      "Meet the people taking part in GraphQL’s working groups, discussing proposals and bringing different experiences to the decisions ahead.",
    action: {
      label: "How to join a working group",
      href: "https://graphql.org/community/contribute/project-meetings/",
    },
    parent: "",
    mode: "grid",
  },
  {
    slug: "ambassadors",
    breadcrumb: "Ambassadors",
    title: "Helping others get involved.",
    description: "Helping others get involved.",
    action: {
      label: "Find a working group",
      href: "/wg/",
    },
    parent: "",
    mode: "grid",
  },
  {
    slug: "speakers",
    breadcrumb: "Speakers",
    title: "Taking the stage.",
    description:
      "Meet the GraphQLConf speakers sharing what they’ve built, what they’ve learned, and the questions they’re still working on.",
    action: {
      label: "Explore GraphQLConf talks",
      href: "/speakers/?view=list",
    },
    parent: "",
    mode: "grid",
  },
];

export const starsPage = (year) => ({
  slug: `stars/${year}`,
  breadcrumb: String(year),
  title: `Class of ${year}`,
  description: `Celebrate the GraphQL Stars class of ${year} and their contributions to GraphQL.`,
  action: action("About GraphQL Stars", "/stars/about/"),
  parent: "stars",
  mode: "grid",
});
export const tscPage = {
  slug: "wg/tsc",
  breadcrumb: "TSC",
  title: "Technical Steering Committee",
  description:
    "Meet the current and emeritus members of the GraphQL Technical Steering Committee.",
  action: action(
    "Apply to be a TSC member",
    "https://github.com/graphql/graphql-wg/blob/main/GraphQL-TSC.md#becoming-a-tsc-member",
  ),
  parent: "wg",
  mode: "grid",
};
export const workingGroupPage = ({ slug, name, description, action }) => ({
  slug: `wg/${slug}`,
  breadcrumb: name,
  title: `${name} Working Group`,
  description,
  action,
  parent: "wg",
  mode: "grid",
});
export const conferencePage = (year) => ({
  slug: `speakers/graphqlconf-${year}`,
  breadcrumb: `GraphQLConf ${year}`,
  title: `GraphQLConf ${year}`,
  description: `Meet the speakers and explore talks from GraphQLConf ${year}.`,
  action: action("Browse talks", `/speakers/graphqlconf-${year}/?view=list`),
  parent: "speakers",
  mode: "grid",
});

export const workingGroups = {
  "graphql-wg": {
    slug: "spec",
    name: "GraphQL Specification",
    description: "Meet the people helping shape the GraphQL Specification.",
    action: {
      label: "Join the GraphQL WG",
      href: "https://github.com/graphql/graphql-wg",
    },
  },
  "ai-wg": {
    slug: "ai",
    name: "AI",
    description:
      "Meet the people helping to explore how GraphQL can best support the growing needs of artificial intelligence and machine learning in the GraphQL AI Working Group.",
    action: {
      label: "Join the AI WG",
      href: "https://github.com/graphql/ai-wg",
    },
  },
  "composite-schemas-wg": {
    slug: "federation",
    name: "Federation",
    description:
      "Meet the people helping shape the GraphQL Federation Specification through the GraphQL Federation Spec working group.",
    action: {
      label: "Join the Federation WG",
      href: "https://github.com/graphql/composite-schemas-wg",
    },
  },
  "golden-path-wg": {
    slug: "golden-path",
    name: "Golden Path",
    description:
      "Meet the people helping to define and document an opinionated set of practices believed to give new users of GraphQL the greatest chance of success with the technology through the Golden Path working group.",
    action: {
      label: "Join the Golden Path WG",
      href: "https://github.com/graphql/golden-path-wg",
    },
  },
  "graphql-js-wg": {
    slug: "graphql-js",
    name: "GraphQL.js",
    description:
      "Meet the people discussing and agreeing upon proposed changes to the GraphQL-JS library and other related foundation libraries.",
    action: {
      label: "Join the GraphQL.js WG",
      href: "https://github.com/graphql/graphql-js-wg",
    },
  },
  graphiql: {
    slug: "graphiql",
    name: "GraphiQL",
    description:
      "Meet the people helping shape GraphiQL through the GraphiQL working group.",
    action: {
      label: "Join the GraphiQL WG",
      href: "https://github.com/graphql/graphiql",
    },
  },
  "graphql-over-http": {
    slug: "http",
    name: "GraphQL over HTTP",
    description:
      "Meet the people helping shape the GraphQL over HTTP Specification.",
    action: {
      label: "Join the GraphQL over HTTP WG",
      href: "https://github.com/graphql/graphql-over-http",
    },
  },
  "otel-wg": {
    slug: "otel",
    name: "OpenTelemetry",
    description:
      "Meet the people defining the best practices and semantic conventions for using OpenTelemetry with GraphQL.",
    action: {
      label: "Join the OTel WG",
      href: "https://github.com/graphql/otel-wg",
    },
  },
  "defer-stream-wg": {
    slug: "defer-stream",
    name: "Defer & Stream",
    description:
      'Meet the people designing and drafting an "incremental delivery" enhancement to the GraphQL specification.',
    action: {
      label: "Join the Incremental Delivery WG",
      href: "https://github.com/graphql/defer-stream-wg",
    },
  },
  "nullability-wg": {
    slug: "nullability",
    name: "Nullability",
    description:
      "Meet the people who gave clients a way to influence or override nullability checks within queries. The nullability implementation has been merged into the main Specification and the group was archived on February 5, 2026.",
    action: {
      label: "Join the Specification WG",
      href: "https://github.com/graphql/graphql-wg",
    },
  },
  "community-wg": {
    slug: "community",
    name: "Community",
    description:
      "Meet the people developing and executing strategic initiatives that reinforce GraphQL's value proposition while fostering an engaged, educated, and expanding community. The Community WG does not meet and instead uses Issues, Pull Requests and Discussions in the GitHub repository.",
    action: {
      label: "Visit the Community WG repo",
      href: "https://github.com/graphql/community-wg",
    },
  },
};
