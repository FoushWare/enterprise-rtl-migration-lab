// Loaded by every generated preview runtime configuration (inside the Vite dev-server process). When the companion that
// started this runtime is gone, the runtime exits. This also covers a SIGKILLed companion, which runs no shutdown code.
export const RUNTIME_OWNER_ENV = 'RTL_RUNTIME_OWNER_PID';
export const RUNTIME_OWNER_CHECK_MS = 500;

/** Starts the owner check when the environment names an owner. Returns a stop function, or undefined when unowned. */
export function watchRuntimeOwner(env: NodeJS.ProcessEnv = process.env): (() => void) | undefined {
  const owner = Number(env[RUNTIME_OWNER_ENV]);
  if (!Number.isInteger(owner) || owner <= 0) return undefined;
  const timer = setInterval(() => {
    try { process.kill(owner, 0); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EPERM') process.exit(0); }
  }, RUNTIME_OWNER_CHECK_MS);
  timer.unref();
  return () => clearInterval(timer);
}
