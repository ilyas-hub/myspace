import dns from "node:dns";

// This machine's default DNS refuses Mongo's SRV-record queries
// (`querySrv ECONNREFUSED` on `_mongodb._tcp.<cluster>.mongodb.net`), which
// breaks any `mongodb+srv://` connection — the same failure ticket-1's
// connection test hit. Point Node's resolver at Google public DNS so the
// `seed` / `delete-profile` CLI scripts can connect locally.
//
// Scoped to CLI scripts only: importing this module in a Next.js route would
// force the server's resolver too, which is not what we want.
try {
  dns.setServers(["8.8.8.8"]);
} catch {
  // Some environments (e.g. corporate networks) forbid switching resolvers.
  // Fail loudly later at connect time rather than crashing on import.
}
