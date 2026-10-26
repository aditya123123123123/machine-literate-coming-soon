// Vercel build step. Production may only be built from the `main` branch.
//
// Vercel lets anyone on the team promote or redeploy a preview build to
// production from the dashboard. That skips the preprod -> main review flow,
// so this check fails any production build that didn't come from `main`.
// Preview builds are not affected.
//
// Rollbacks still work: Vercel's instant rollback reuses an existing
// production build and doesn't run this step.

export const PRODUCTION_BRANCH = 'main';

export function checkProductionRef(env) {
  if (env.VERCEL_ENV !== 'production') {
    return { ok: true, message: `Not a production build (VERCEL_ENV=${env.VERCEL_ENV || 'unset'}).` };
  }
  const ref = env.VERCEL_GIT_COMMIT_REF;
  if (ref === PRODUCTION_BRANCH) {
    return { ok: true, message: `Production build from ${PRODUCTION_BRANCH} (${(env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7)}).` };
  }
  return {
    ok: false,
    message:
      `Blocked: production can only be built from "${PRODUCTION_BRANCH}", ` +
      `but this build is from ${ref ? `"${ref}"` : 'no Git branch (CLI or unknown source)'}. ` +
      'Merge the change into preprod, then release preprod -> main.',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, message } = checkProductionRef(process.env);
  (ok ? console.log : console.error)(message);
  process.exit(ok ? 0 : 1);
}
