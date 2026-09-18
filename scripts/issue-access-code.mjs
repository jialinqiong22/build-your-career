import { issueAccessCode } from "../lib/premium-access.ts";

const args = process.argv.slice(2);
function fail(message) {
  console.error(message);
  process.exit(1);
}
if (args.length !== 8 || args[0] !== "--order" || args[2] !== "--expires" || args[4] !== "--user" || args[6] !== "--plan") {
  fail(
    "Usage: node --experimental-strip-types scripts/issue-access-code.mjs --order ORDER_ID --expires 2027-01-01T00:00:00+08:00 --user USER_ID --plan standard|guided",
  );
}
const [, order, , expires, , user, , plan] = args;
const userId = Number(user);
if (!Number.isSafeInteger(userId) || userId < 1 || !["standard", "guided"].includes(plan)) fail("A valid recipient user ID and plan are required.");
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(expires))
  fail("Expiry must be an explicit ISO date-time with timezone.");
const instant = Date.parse(expires);
const dateParts = expires.slice(0, 10).split("-").map(Number);
const checkDate = new Date(
  Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]),
);
if (
  !Number.isFinite(instant) ||
  checkDate.toISOString().slice(0, 10) !== expires.slice(0, 10)
)
  fail("Invalid expiry date.");
try {
  console.log(issueAccessCode(order, Math.floor(instant / 1000), Math.floor(Date.now() / 1000), userId, plan));
} catch (error) {
  fail(error.message);
}
