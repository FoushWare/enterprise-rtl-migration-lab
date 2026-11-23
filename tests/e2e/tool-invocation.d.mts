// Declarations for tool-invocation.mjs (the runtime module is unchanged).

export interface ToolInvocationEnvironment {
  readonly platform?: NodeJS.Platform;
  readonly nodeExecutable?: string;
  /** npm's CLI path when npm started this process; an empty string disables it. */
  readonly npmExecPath?: string;
  readonly exists?: (path: string) => boolean;
}

export interface BinaryInvocationEnvironment {
  readonly platform?: NodeJS.Platform;
  readonly nodeExecutable?: string;
  readonly readText?: (path: string) => string;
  readonly exists?: (path: string) => boolean;
}

export interface ResolvedInvocation {
  readonly file: string;
  readonly args: string[];
}

/** Resolves npm or npx to a file that spawn can start without a shell. */
export function toolInvocation(name: string, args: readonly string[], environment?: ToolInvocationEnvironment): ResolvedInvocation;

/** Resolves an installed package binary declared in the package's bin metadata. */
export function binaryInvocation(projectDirectory: string, packageName: string, binName: string, args: readonly string[], environment?: BinaryInvocationEnvironment): ResolvedInvocation;
