/**
 * Guard only: the database reset itself happens in e2e/prepare-db.ts,
 * before the test server is built. This stops a run early, with a clear
 * message, if the test database isn't configured or looks like the live one.
 */
export default async function globalSetup() {
  const test = process.env.TEST_DATABASE_URL;
  const testDirect = process.env.TEST_DATABASE_URL_UNPOOLED;
  if (!test || !testDirect) {
    throw new Error("TEST_DATABASE_URL / TEST_DATABASE_URL_UNPOOLED are not set (see e2e/README.md).");
  }
  const live = [process.env.DATABASE_URL, process.env.DATABASE_URL_UNPOOLED].filter(Boolean);
  if (live.includes(test) || live.includes(testDirect) || !/\/studio_site_test\?/.test(test + testDirect)) {
    throw new Error("Refusing to run: the test database URL points at the live database.");
  }
}
