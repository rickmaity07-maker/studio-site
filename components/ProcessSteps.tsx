const steps = [
  {
    n: "01",
    title: "Discover",
    body: "A short call about your business, your customers, and what the site actually needs to do — book a table, take an order, build trust."
  },
  {
    n: "02",
    title: "Design",
    body: "A direction built around your brand, not a template — real layout decisions, not a theme picker."
  },
  {
    n: "03",
    title: "Build",
    body: "Production code from the first commit: Next.js, proper data handling, and security rules that hold up, not a throwaway prototype."
  },
  {
    n: "04",
    title: "Launch",
    body: "Deployed, tested on real devices, and handed to you with a page like this one to click through before it goes live for customers."
  }
];

export function ProcessSteps() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s) => (
        <li key={s.n} className="flex flex-col gap-3 bg-surface p-6">
          <span className="font-mono text-sm text-live">{s.n}</span>
          <h3 className="font-display text-lg">{s.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
