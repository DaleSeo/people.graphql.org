interface Attendee {
  name: string;
  github: string;
  org: string;
  location: string;
}

interface Meeting {
  start: string;
  attendees: Attendee[];
}

interface AgendaDetails {
  meetings: Meeting[];
}

interface SummaryAttendee {
  github: string;
  name: string;
  org: string;
  location: string;
  count: number;
}

export function summarizeAgendaDetails({ meetings }: AgendaDetails): {
  attendees: SummaryAttendee[];
} {
  const attendees = new Map<string, SummaryAttendee>();

  for (const meeting of [...meetings].sort((a, b) =>
    a.start.localeCompare(b.start),
  )) {
    for (const attendee of meeting.attendees) {
      const github = attendee.github.trim().replace(/^@/, "");
      const githubKey = github.toLowerCase();
      if (!githubKey) continue;

      const existing = attendees.get(githubKey) ?? {
        github,
        name: "",
        org: "",
        location: "",
        count: 0,
      };
      const name = cleanName(attendee.name);

      existing.github = github;
      if (name) existing.name = name;
      if (attendee.org.trim()) existing.org = attendee.org.trim();
      if (attendee.location.trim())
        existing.location = attendee.location.trim();
      existing.count += 1;
      attendees.set(githubKey, existing);
    }
  }

  return {
    attendees: [...attendees.values()].sort((a, b) => {
      const aKey = a.github.toLowerCase();
      const bKey = b.github.toLowerCase();
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    }),
  };
}

function cleanName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

let input = "";
for await (const chunk of process.stdin) input += chunk;
const details = JSON.parse(input) as AgendaDetails;
console.log(JSON.stringify(summarizeAgendaDetails(details), null, 2));
