// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/css.ts
import postcss from "postcss";
import valueParser from "postcss-value-parser";

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/model.ts
import { createHash } from "node:crypto";
var hash = (s) => createHash("sha256").update(s).digest("hex");
function range(text, start, end) {
  const point = (offset) => {
    const lines = text.slice(0, offset).split(/\r\n|\r|\n/);
    return { offset, line: lines.length, column: lines.at(-1).length + 1 };
  };
  return { start: point(start), end: point(end) };
}
function fact(path, text, mechanism, context, property, value, start, end, semantics = "css", tokens) {
  return { id: hash(`${path}|${mechanism}|${context}|${property}|${start}`).slice(0, 24), path, mechanism, context, property, value, original: text.slice(start, end), range: range(text, start, end), semantics, ...tokens ? { tokens } : {} };
}

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/css.ts
function extractCss(path, original, fragment = original, base = 0, mechanism = "css", context = "stylesheet") {
  const evidence = [], diagnostics = [];
  try {
    const root = postcss.parse(fragment, { from: void 0 });
    root.walkDecls((d) => {
      const start = base + d.source.start.offset, end = base + d.source.end.offset;
      const parents = [];
      let p = d.parent;
      while (p && p.type !== "root") {
        parents.unshift(p.type === "rule" ? p.selector : p.type === "atrule" ? `@${p.name} ${p.params}` : "container");
        p = p.parent;
      }
      evidence.push(fact(path, original, mechanism, `${context}/${parents.join("/")}`, d.prop, d.value, start, end, "css", valueParser(d.value).nodes.map((n) => valueParser.stringify(n))));
    });
  } catch {
    diagnostics.push({ path, code: "CSS_PARSE", message: "CSS fragment could not be parsed; coverage incomplete.", range: range(original, base, base + fragment.length) });
  }
  return { evidence, diagnostics };
}

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/rules.ts
import ts2 from "typescript";

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/runtime-direction.ts
import ts from "typescript";
var unwrap = (x) => ts.isParenthesizedExpression(x) ? unwrap(x.expression) : x;
var key = (x) => ts.isIdentifier(x) || ts.isStringLiteral(x) ? x.text : void 0;
var signature = (x) => {
  if (ts.isIdentifier(x) || ts.isStringLiteral(x) || ts.isNumericLiteral(x)) return `${x.kind}:${x.text}`;
  const children = [];
  ts.forEachChild(x, (n) => {
    children.push(signature(n));
  });
  return `${x.kind}(${children.join("|")})`;
};
function analyzeRuntimeDirection(sf) {
  const imports = /* @__PURE__ */ new Map();
  const namespaces = /* @__PURE__ */ new Map();
  const ambiguousImports = /* @__PURE__ */ new Set();
  const register = (name, value) => {
    if (imports.has(name)) ambiguousImports.add(name);
    imports.set(name, value);
  };
  const declarations = /* @__PURE__ */ new Map();
  const allNodes = [];
  function collect(n) {
    allNodes.push(n);
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const c = n.importClause, module = n.moduleSpecifier.text;
      if (c?.name) register(c.name.text, `${module}:${c.isTypeOnly ? "type:" : ""}default`);
      if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) for (const e of c.namedBindings.elements) {
        register(e.name.text, `${module}:${e.isTypeOnly || c?.isTypeOnly ? "type:" : ""}${e.propertyName?.text ?? e.name.text}`);
      }
      if (c?.namedBindings && ts.isNamespaceImport(c.namedBindings)) namespaces.set(c.namedBindings.name.text, module);
    }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      const items = declarations.get(n.name.text) ?? [];
      items.push(n);
      declarations.set(n.name.text, items);
    }
    ts.forEachChild(n, collect);
  }
  collect(sf);
  const lexical = /* @__PURE__ */ new Map();
  const lexicalScope = (n) => {
    let p = n.parent;
    while (p && !ts.isBlock(p) && !ts.isSourceFile(p) && !ts.isFunctionLike(p) && !ts.isCatchClause(p) && !ts.isForStatement(p) && !ts.isForInStatement(p) && !ts.isForOfStatement(p)) p = p.parent;
    return p ?? sf;
  };
  const record = (owner, name, node) => {
    if (ts.isIdentifier(name)) {
      const table = lexical.get(owner) ?? /* @__PURE__ */ new Map();
      table.set(name.text, [...table.get(name.text) ?? [], node]);
      lexical.set(owner, table);
    } else for (const element of name.elements) if (ts.isBindingElement(element)) record(owner, element.name, element);
  };
  for (const n of allNodes) {
    if (ts.isVariableDeclaration(n)) {
      let owner = lexicalScope(n);
      if (ts.isVariableDeclarationList(n.parent) && !(n.parent.flags & ts.NodeFlags.BlockScoped)) {
        while (!ts.isFunctionLike(owner) && !ts.isSourceFile(owner)) owner = lexicalScope(owner);
      }
      record(owner, n.name, n);
    } else if (ts.isParameter(n)) record(n.parent, n.name, n);
    else if ((ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n)) && n.name) record(lexicalScope(n), n.name, n);
    else if ((ts.isFunctionExpression(n) || ts.isClassExpression(n)) && n.name) record(n, n.name, n);
  }
  const nearest = (x) => {
    let p = x;
    while (p) {
      const matches = lexical.get(p)?.get(x.text);
      if (matches) return matches.length === 1 ? matches[0] : p;
      p = p.parent;
    }
    return;
  };
  const isShadowedImport = (x) => nearest(x) !== void 0;
  const binding = (x) => ts.isIdentifier(x) && !ambiguousImports.has(x.text) && !isShadowedImport(x) ? imports.get(x.text) : void 0;
  const definition = (x) => {
    const d = nearest(x);
    if (!d || !ts.isVariableDeclaration(d) || !ts.isIdentifier(d.name) || !d.initializer || !ts.isVariableDeclarationList(d.parent) || !(d.parent.flags & ts.NodeFlags.Const)) return;
    return { expression: d.initializer, declaration: d };
  };
  const moduleDefinition = (d) => ts.isVariableStatement(d.declaration.parent.parent) && ts.isSourceFile(d.declaration.parent.parent.parent);
  const properties = (x) => {
    if (!ts.isObjectLiteralExpression(x)) return;
    const result = /* @__PURE__ */ new Map();
    for (const p of x.properties) {
      if (!ts.isPropertyAssignment(p)) return;
      const name = key(p.name);
      if (!name || result.has(name)) return;
      result.set(name, p);
    }
    return result;
  };
  const escaped = (d) => allNodes.some((n) => {
    if (!ts.isIdentifier(n) || definition(n)?.declaration !== d.declaration || n === d.declaration.name) return false;
    let p = n;
    while (ts.isPropertyAccessExpression(p.parent) || ts.isElementAccessExpression(p.parent)) p = p.parent;
    const parent = p.parent;
    return ts.isBinaryExpression(parent) && parent.left === p && parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment || (ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent) || ts.isDeleteExpression(parent)) || ts.isCallExpression(parent) || ts.isNewExpression(parent) || ts.isReturnStatement(parent) || ts.isPropertyAssignment(parent) || ts.isArrayLiteralExpression(parent) || ts.isVariableDeclaration(parent) || ts.isExportSpecifier(parent);
  });
  const reasons = [];
  const fail = (reason) => {
    reasons.push(reason);
    return void 0;
  };
  function cache(x) {
    x = unwrap(x);
    if (!ts.isIdentifier(x)) return fail("Cache must reference a module const created by the directly imported factory.");
    const d = definition(x);
    if (!d || !moduleDefinition(d) || escaped(d) || ts.isVariableStatement(d.declaration.parent.parent) && d.declaration.parent.parent.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return fail("Cache definition is ambiguous, mutable, escaping or created inside a render/function.");
    const call = d.expression;
    if (!ts.isCallExpression(call) || binding(call.expression) !== "@emotion/cache:default" || call.arguments.length !== 1) return fail("Unknown cache factory or nonliteral cache options.");
    const props = properties(call.arguments[0]);
    if (!props || [...props.keys()].some((k2) => !["key", "stylisPlugins"].includes(k2))) return fail("Cache options contain unsupported fields, duplicate keys or spreads.");
    const k = props.get("key")?.initializer;
    if (!k || !ts.isStringLiteral(k) || !/^[a-z-]+$/.test(k.text)) return fail("Cache key must be a nonempty literal lowercase/hyphen string.");
    const plugins = props.get("stylisPlugins")?.initializer;
    if (!plugins || !ts.isArrayLiteralExpression(plugins)) return fail("Missing or dynamic plugin array; prefixer must be explicit.");
    const names = plugins.elements.map((p) => binding(p));
    if (names[0] !== "stylis:prefixer") return fail("Missing prefixer or incorrect plugin order.");
    let direction;
    if (names.length === 1) direction = "ltr";
    else if (names.length === 2 && names[1] === "@mui/stylis-plugin-rtl:default") direction = "rtl";
    else return fail("Missing/unknown/dynamic/duplicate RTL processor or unsupported plugin order.");
    return { direction, key: k.text, declaration: d.declaration };
  }
  function theme(x) {
    x = unwrap(x);
    if (!ts.isIdentifier(x)) return fail("Theme must reference a module const with explicit literal direction.");
    const d = definition(x);
    if (!d || !moduleDefinition(d) || escaped(d)) return fail("Theme definition is ambiguous, mutable, escaping or render-local.");
    const call = d.expression;
    if (!ts.isCallExpression(call) || !["@mui/material:createTheme", "@mui/material/styles:createTheme"].includes(binding(call.expression) ?? "") || call.arguments.length !== 1) return fail("Unsupported theme factory/options.");
    const props = properties(call.arguments[0]), p = props?.get("direction");
    if (!p || !ts.isStringLiteral(p.initializer) || !["ltr", "rtl"].includes(p.initializer.text)) return fail("Theme direction is not an explicit supported literal.");
    return { direction: p.initializer.text, property: p };
  }
  function selection(x, leaf, seen = /* @__PURE__ */ new Set()) {
    x = unwrap(x);
    if (ts.isIdentifier(x)) {
      const d = definition(x);
      if (d && ts.isConditionalExpression(unwrap(d.expression))) {
        if (seen.has(d.declaration) || escaped(d)) return fail("Cyclic or escaping selection alias.");
        return selection(d.expression, leaf, /* @__PURE__ */ new Set([...seen, d.declaration]));
      }
    }
    if (ts.isConditionalExpression(x)) {
      const c = unwrap(x.condition);
      if (!ts.isBinaryExpression(c) || c.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken || !ts.isIdentifier(c.left) || !ts.isStringLiteral(c.right) || !["rtl", "ar"].includes(c.right.text)) return fail("Unsupported direction predicate.");
      const yes = leaf(x.whenTrue), no = leaf(x.whenFalse);
      return yes && no ? { predicate: signature(c), yes, no } : void 0;
    }
    const value = leaf(x);
    return value !== void 0 ? { yes: value, no: value } : void 0;
  }
  const attribute = (n, name) => {
    if (n.attributes.properties.some((p) => ts.isJsxSpreadAttribute(p))) return;
    const attrs = n.attributes.properties.filter((p) => ts.isJsxAttribute(p) && p.name.getText(sf) === name);
    const a = attrs[0];
    return attrs.length === 1 && ts.isJsxAttribute(a) && a.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : void 0;
  };
  const importedTag = (n, role) => {
    const name = n.tagName.getText(sf);
    if (imports.get(name)?.endsWith(`:${role}`)) return true;
    if (ts.isPropertyAccessExpression(n.tagName) && ts.isIdentifier(n.tagName.expression) && namespaces.has(n.tagName.expression.text) && n.tagName.name.text === role) return true;
    const d = ts.isIdentifier(n.tagName) ? definition(n.tagName) : void 0;
    return !!d && ts.isIdentifier(d.expression) && imports.get(d.expression.text)?.endsWith(`:${role}`) === true;
  };
  const openings = allNodes.filter((n) => ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n));
  const cacheNodes = openings.filter((n) => importedTag(n, "CacheProvider") || n.tagName.getText(sf) === "CacheProvider");
  const proofs = [];
  for (const node of cacheNodes) {
    reasons.length = 0;
    if (binding(node.tagName) !== "@emotion/react:CacheProvider") fail("Unresolved CacheProvider alias, namespace, wrapper or re-export.");
    const value = attribute(node, "value");
    const cs = value ? selection(value, cache) : fail("CacheProvider value missing, duplicated or spread.");
    const parent = node.parent;
    const children = ts.isJsxElement(parent) && parent.openingElement === node ? parent.children.filter((n) => !ts.isJsxText(n) || n.getText(sf).trim()) : [];
    const nested = children.length === 1 && ts.isJsxElement(children[0]) ? children[0].openingElement : void 0;
    if (!nested || !["@mui/material:ThemeProvider", "@mui/material/styles:ThemeProvider"].includes(binding(nested.tagName) ?? "")) fail("A single direct ThemeProvider child is required; wrapper topology is unresolved.");
    const tv = nested && attribute(nested, "theme");
    const th = tv ? selection(tv, theme) : fail("Theme selection is missing or unsupported.");
    if (cs && th && (cs.predicate !== th.predicate || cs.yes.direction !== th.yes.direction || cs.no.direction !== th.no.direction)) fail("Theme/cache direction selection mismatch.");
    if (cs) {
      if (cs.predicate && (cs.yes.direction !== "rtl" || cs.no.direction !== "ltr")) fail("RTL/Arabic predicate branches must select RTL then LTR.");
      const definitions = /* @__PURE__ */ new Map();
      for (const list of declarations.values()) for (const d of list) if (d.initializer && ts.isCallExpression(d.initializer) && binding(d.initializer.expression) === "@emotion/cache:default") {
        const p = d.initializer.arguments[0] && properties(d.initializer.arguments[0]);
        const k = p?.get("key")?.initializer;
        if (k && ts.isStringLiteral(k)) definitions.set(d, k.text);
      }
      if (new Set(definitions.values()).size !== definitions.size) fail("Duplicate cache keys in analyzed file.");
      if (cs.yes.direction !== cs.no.direction && cs.yes.key === cs.no.key) fail("LTR and RTL caches require distinct keys.");
      const docs = allNodes.filter((n) => ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.left.getText(sf) === "document.documentElement.dir");
      const ds = docs.map((n) => selection(n.right, (x) => ts.isStringLiteral(x) && ["ltr", "rtl"].includes(x.text) ? x.text : void 0));
      if (!ds.length || ds.some((d) => !d || d.predicate !== cs.predicate || d.yes !== cs.yes.direction || d.no !== cs.no.direction)) fail("Document/theme/cache selection cannot be correlated within this source file.");
    }
    if (cs?.predicate) {
      let predicateBinding2 = function(n) {
        const resolved = nearest(n);
        if (!resolved) return;
        if (ts.isVariableDeclaration(resolved)) return definition(n)?.declaration;
        if (ts.isParameter(resolved)) return ts.isIdentifier(resolved.name) && !resolved.initializer && !resolved.dotDotDotToken ? resolved : void 0;
        if (!ts.isBindingElement(resolved) || resolved.initializer || resolved.dotDotDotToken || !ts.isObjectBindingPattern(resolved.parent)) return;
        const owner = resolved.parent.parent;
        if (ts.isParameter(owner)) return !owner.initializer && !owner.dotDotDotToken ? resolved : void 0;
        if (ts.isVariableDeclaration(owner) && ts.isVariableDeclarationList(owner.parent) && owner.parent.flags & ts.NodeFlags.Const) return resolved;
        return;
      };
      var predicateBinding = predicateBinding2;
      const conditions = [];
      for (const x of [value, tv, ...allNodes.filter((n) => ts.isBinaryExpression(n) && n.left.getText(sf) === "document.documentElement.dir").map((n) => n.right)]) {
        if (!x) continue;
        let e = unwrap(x);
        if (ts.isIdentifier(e)) {
          const d = definition(e);
          if (d) e = unwrap(d.expression);
        }
        if (ts.isConditionalExpression(e) && ts.isBinaryExpression(e.condition) && ts.isIdentifier(e.condition.left)) conditions.push(e.condition.left);
      }
      const declarationsFor = conditions.map(predicateBinding2);
      if (!conditions.length || declarationsFor.some((d) => !d) || new Set(declarationsFor).size !== 1) fail("Direction predicate binding is unresolved or differs between selectors.");
      if (conditions.some((n) => allNodes.some((x) => ts.isBinaryExpression(x) && x.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && x.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isIdentifier(x.left) && nearest(x.left) === predicateBinding2(n) || (ts.isPostfixUnaryExpression(x) || ts.isPrefixUnaryExpression(x)) && ts.isIdentifier(x.operand) && nearest(x.operand) === predicateBinding2(n)))) fail("Direction predicate is reassigned; sequencing is unsupported.");
    }
    proofs.push({ node, supported: reasons.length === 0, reasons: [...new Set(reasons)], themeDirections: reasons.length === 0 && th ? [.../* @__PURE__ */ new Set([th.yes.property, th.no.property])] : [] });
  }
  const nestedThemes = new Set(proofs.map((p) => {
    const parent = p.node.parent;
    return ts.isJsxElement(parent) ? parent.children.find(ts.isJsxElement)?.openingElement : void 0;
  }));
  const extraThemes = openings.some((n) => importedTag(n, "ThemeProvider") && !nestedThemes.has(n));
  if (extraThemes) for (const p of proofs) {
    p.supported = false;
    p.themeDirections = [];
    p.reasons.push("Additional ThemeProvider topology remains unresolved.");
  }
  if (proofs.length && proofs.every((p) => p.supported)) {
    for (const list of declarations.values()) for (const declaration of list) {
      const expression = declaration.initializer;
      if (!expression || !ts.isCallExpression(expression) || !["@mui/material:createTheme", "@mui/material/styles:createTheme"].includes(binding(expression.expression) ?? "")) continue;
      if (!ts.isVariableStatement(declaration.parent.parent) || declaration.parent.parent.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      const refs = allNodes.filter((n) => ts.isIdentifier(n) && n !== declaration.name && definition(n)?.declaration === declaration);
      const property = expression.arguments[0] && properties(expression.arguments[0])?.get("direction");
      if (!refs.length && property && ts.isStringLiteral(property.initializer)) proofs[0].themeDirections.push(property);
    }
  }
  for (const [name, source] of imports) if (source.endsWith(":CacheProvider")) {
    const uses = allNodes.filter((n) => ts.isIdentifier(n) && n.text === name && binding(n) === source && !ts.isImportSpecifier(n.parent) && !ts.isJsxClosingElement(n.parent));
    const untraced = uses.find((n) => !proofs.some((p) => p.node === n.parent) && !ts.isImportClause(n.parent));
    if (untraced || !cacheNodes.length) {
      const node = untraced ?? allNodes.find((n) => ts.isImportSpecifier(n) && n.name.text === name);
      proofs.push({ node, supported: false, reasons: ["CacheProvider binding escapes into an unresolved alias/wrapper or has no traceable JSX use."], themeDirections: [] });
      for (const p of proofs) p.themeDirections = [];
    }
  }
  return proofs;
}

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/rules.ts
import valueParser2 from "postcss-value-parser";
var plain = (v) => v.replace(/^['"`]|['"`]$/g, "");
var cssKey = (p) => p.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
function detect(evidence, sources, policy, diagnostics) {
  const findings = [];
  const findingOccurrences = /* @__PURE__ */ new Map();
  function add(ruleId, title, a, category, rationale, treatment, ownership = "unknown", refs = [], confidence = "High", severity = "Minor", suggestion = null, limitation = "Static evidence indicates a risk; rendered behavior is not established by this scan.") {
    const exception = policy.exceptions.find((x) => x.ruleId === ruleId && x.path === a.path && x.context === a.context && x.originalDigest === hash(a.original));
    const originalCategory = category;
    if (exception) category = exception.category;
    const key2 = ruleId + "|" + a.id;
    const occurrence = findingOccurrences.get(key2) ?? 0;
    findingOccurrences.set(key2, occurrence + 1);
    findings.push({ id: ruleId + ":" + hash(a.id + "|" + occurrence).slice(0, 24), ruleId, ruleVersion: 1, category, severity: category === "INFORMATIONAL" || category === "INTENTIONAL_LTR" ? "Info" : severity, confidence, title, sourceMechanism: "mechanism" in a ? a.mechanism : "typescript-structure", applications: a.path.startsWith("apps/") ? [a.path.split("/")[1]] : [], path: a.path, range: a.range, original: a.original, context: a.context, ownership, rationale, treatment, evidenceIds: refs.map((e) => e.id).sort(), relatedLocations: refs.filter((e) => e.id !== a.id).map((e) => ({ path: e.path, range: e.range })), issueIds: policy.issueBindings.filter((b) => b.ruleId === ruleId && b.path === a.path && a.context.includes(b.contextIncludes) && (!b.originalIncludes || a.original.includes(b.originalIncludes))).map((b) => b.issueId).sort(), suggestion: exception ? null : suggestion, limitation, ...exception ? { exceptionReason: exception.reason, originalCategory } : {} });
    return findings.at(-1);
  }
  for (const e of evidence) {
    if (cssKey(e.property) === "position" && plain(e.value) === "fixed") {
      const peers2 = evidence.filter((x) => x.path === e.path && x.context === e.context);
      const width = peers2.find((x) => cssKey(x.property) === "width");
      const gutters = width ? evidence.filter((x) => /^margin-(left|right)$/.test(cssKey(x.property)) && plain(x.value) === plain(width.value)) : [];
      if (width && gutters.length) add("RTL.GEOMETRY.COUPLED", "Fixed shell width and physical content reservation", e, "MANUAL_REVIEW", "Fixed region width equals a separate physical content margin; independently flipping either can desynchronize shell geometry.", "Review anchor, gutter, border, mobile transform and resets together.", policy.ownership[e.mechanism] ?? "unknown", [e, ...peers2.filter((x) => /^(left|right|width|border-right|transform)$/.test(cssKey(x.property))), ...gutters], "High");
    }
    if (e.mechanism === "html-root") continue;
    const overrides = policy.ownerOverrides?.filter((x) => x.path === e.path && x.context === e.context) ?? [];
    const owners = new Set(overrides.map((x) => x.owner));
    const p = cssKey(e.property), v = plain(e.value), owner = owners.size > 1 ? "conflicting" : overrides[0]?.owner ?? policy.ownership[e.mechanism] ?? "unknown";
    if (owner === "conflicting" && !findings.some((f) => f.ruleId === "RTL.OWNERSHIP.CONFLICT" && f.path === e.path && f.context === e.context)) add("RTL.OWNERSHIP.CONFLICT", "Conflicting style owners", e, "MANUAL_REVIEW", "Multiple data-only policy entries claim different ownership for the same style context.", "Resolve ownership before proposing logical conversion or RTL processing.", owner, [e], "High");
    const peers = evidence.filter((x) => x.path === e.path && x.context === e.context);
    const position = peers.find((x) => cssKey(x.property) === "position");
    const dynamic = diagnostics.some((d) => d.path === e.path && d.blocking && d.range.start.offset >= e.range.start.offset && d.range.end.offset <= e.range.end.offset);
    if (/^(left|right)$/.test(p)) add("RTL.GEOMETRY.EDGE", "Physical positioned edge", e, "MANUAL_REVIEW", "Physical edge is coupled to placement, containing block and clearance; logical replacement alone does not select the correct side.", "Review anchor, companion gutter, breakpoints and collision clearance as one layout contract.", owner, [e, ...position ? [position] : []], "High");
    else if (/^(margin|padding|border)-(left|right)(-|$)/.test(p) || /^(border-top-left-radius|border-top-right-radius|border-bottom-left-radius|border-bottom-right-radius)$/.test(p) || /^(text-align|float|clear)$/.test(p) && /^(left|right)$/.test(v)) {
      const approval = policy.approvals.find((a) => a.path === e.path && a.context === e.context && a.property === e.property && a.value === e.value && a.owner === owner && a.sourceDigest === hash(sources.get(e.path) ?? ""));
      const expectedLogical = p.replace(/^(margin|padding|border)-(left|right)(.*)$/, (_, group, side, suffix) => `${group}-inline-${side === "left" ? "start" : "end"}${suffix}`);
      const safe = approval && cssKey(approval.logicalProperty) === expectedLogical && !evidence.some((x) => cssKey(x.property) === "writing-mode" && plain(x.value) !== "horizontal-tb") && e.mechanism !== "mui-sx" && !/^(inherit|initial|unset|revert|revert-layer)$/.test(v) && !/\b(var|env)\(/.test(v) && !dynamic && ["custom-css", "custom-inline", "custom-emotion-logical"].includes(owner) && /^(margin|padding|border)-(left|right)(-|$)/.test(p) && !diagnostics.some((d) => d.blocking) && !peers.some((x) => x !== e && cssKey(x.property) === p) && !position && !peers.some((x) => /writing-mode|direction/.test(cssKey(x.property)));
      add("RTL.CSS.PHYSICAL", "Physical horizontal declaration", e, safe ? "AUTO_CANDIDATE" : "MANUAL_REVIEW", safe ? approval.reason : "Physical syntax does not establish reading-start/end intent or styling ownership.", "Review semantics, writing mode, cascade and owner before any conversion.", owner, [e], "High", "Minor", safe ? { property: approval.logicalProperty, value: e.value } : null);
    } else if (/^(margin|padding|inset|border-radius)$/.test(p)) {
      const tokens = valueParser2(v).nodes.filter((n) => n.type !== "space" && n.type !== "comment");
      const simple = tokens.every((n) => n.type === "word");
      const words = tokens.map((n) => valueParser2.stringify(n));
      const asymmetric = p === "border-radius" ? words.length > 1 && new Set(words).size > 1 : words.length === 4 && words[1] !== words[3];
      if (asymmetric || !simple && words.length > 0 && !/^[-\d.%pxemauto ]+$/.test(v)) add("RTL.CSS.SHORTHAND", "Shorthand needs side/corner review", e, "MANUAL_REVIEW", "Shorthand may encode unequal physical sides, elliptical corners or unresolved values.", "Review tokenized values and cascade; do not split functions or reverse corner order blindly.", owner, [e], simple ? "High" : "Medium");
    } else if (p === "transform" && /translateX\((?!0\))/i.test(v) || /^(transform-origin|background-position|box-shadow)$/.test(p) && /left|right|\d/.test(v) || p === "order" || p === "flex-direction" && v === "row-reverse" || /^grid-(column|row|area)/.test(p) && !/^auto$/.test(v) && !/^1\s*\/\s*-1$/.test(v)) add("RTL.GEOMETRY.ORDER", "Directional geometry or explicit order", e, "MANUAL_REVIEW", "Transform/axis/order semantics require geometric and reading-order decisions.", "Review spatial intent, focus order and companion positioning; no numeric sign reversal.", owner, [e], "Medium");
  }
  const themes = [], rtl = evidence.filter((e) => e.mechanism === "html-root" && e.property === "dir" && e.value === "rtl"), providers = [], caches = [], cacheChecks = /* @__PURE__ */ new Map();
  const entries = [...sources.entries()].filter(([p]) => /\.[jt]sx?$/.test(p));
  for (const [path, text] of entries) {
    let importsVisit2 = function(n) {
      if (ts2.isImportDeclaration(n) && ts2.isStringLiteral(n.moduleSpecifier)) {
        if (n.importClause?.name) imports.set(n.importClause.name.text, n.moduleSpecifier.text);
        if (n.importClause?.namedBindings && ts2.isNamedImports(n.importClause.namedBindings)) for (const x of n.importClause.namedBindings.elements) imports.set(x.name.text, n.moduleSpecifier.text + ":" + (x.propertyName?.text ?? x.name.text));
      }
      ts2.forEachChild(n, importsVisit2);
    }, ctx2 = function(n) {
      let p = n;
      while (p) {
        if (ts2.isFunctionDeclaration(p) && p.name) return p.name.text;
        if (ts2.isVariableDeclaration(p) && ts2.isIdentifier(p.name)) return p.name.text;
        p = p.parent;
      }
      return "module";
    }, identity2 = function(n) {
      if (ts2.isJsxText(n)) return "JsxText:" + n.getText(sf).trim();
      if (ts2.isIdentifier(n) || ts2.isStringLiteral(n) || ts2.isNumericLiteral(n)) return ts2.SyntaxKind[n.kind] + ":" + n.text;
      const parts = [];
      ts2.forEachChild(n, (x) => {
        parts.push(identity2(x));
      });
      return ts2.SyntaxKind[n.kind] + "(" + parts.join("|") + ")";
    }, anchor2 = function(n, context = ctx2(n)) {
      const a = { path, range: range(text, n.getStart(sf), n.end), original: n.getText(sf), context, id: hash(path + "|" + context + "|" + ts2.SyntaxKind[n.kind] + "|" + identity2(n)) };
      return a;
    }, isolated2 = function(n) {
      let p = n.parent;
      while (p && !ts2.isFunctionDeclaration(p) && !ts2.isVariableDeclaration(p)) {
        if (ts2.isJsxElement(p)) {
          const o = p.openingElement;
          if (o.tagName.getText(sf) === "bdi" || o.attributes.properties.some((x) => ts2.isJsxAttribute(x) && x.name.getText(sf) === "dir" && x.initializer && ts2.isStringLiteral(x.initializer) && ["ltr", "auto"].includes(x.initializer.text))) return true;
          const style = o.attributes.properties.find((x) => ts2.isJsxAttribute(x) && x.name.getText(sf) === "style");
          if (style && ts2.isJsxAttribute(style) && style.initializer && ts2.isJsxExpression(style.initializer) && style.initializer.expression && ts2.isObjectLiteralExpression(style.initializer.expression) && style.initializer.expression.properties.some((x) => ts2.isPropertyAssignment(x) && x.name.getText(sf) === "unicodeBidi" && ts2.isStringLiteral(x.initializer) && x.initializer.text === "isolate")) return true;
        }
        p = p.parent;
      }
      return false;
    }, visit2 = function(n) {
      for (const proof of runtimeProofs.filter((p) => p.node === n)) {
        const cacheAnchor = anchor2(n, ctx2(n) + (ts2.isJsxOpeningElement(n) || ts2.isJsxSelfClosingElement(n) ? "/" + n.tagName.getText(sf) : ""));
        caches.push(cacheAnchor);
        if (!proof.supported) cacheChecks.set(cacheAnchor, proof.reasons);
      }
      if (ts2.isCallExpression(n) && ts2.isIdentifier(n.expression) && imports.get(n.expression.text)?.endsWith(":createTheme")) {
        for (const arg of n.arguments) if (ts2.isObjectLiteralExpression(arg)) {
          for (const p of arg.properties) if (ts2.isPropertyAssignment(p) && p.name.getText(sf) === "direction") {
            if (ts2.isStringLiteral(p.initializer) && p.initializer.text === "ltr" && !provenThemes.has(p)) themes.push(anchor2(p));
            else if (!ts2.isStringLiteral(p.initializer)) {
              const a = anchor2(p);
              diagnostics.push({ path, range: a.range, code: "RUNTIME_DIRECTION_UNKNOWN", message: "Theme direction expression not statically resolved.", impact: "DIRECTIONAL_UNSUPPORTED", blocking: true, rationale: "Runtime direction cannot be safely correlated." });
              add("RTL.RUNTIME.DIRECTION_UNKNOWN", "Dynamic runtime direction requires review", a, "RUNTIME_CONFIG", "Direction is supplied by an unresolved expression.", "Review document/theme/cache synchronization without evaluating application code.", policy.generatedStyleOwner ?? "unknown", [], "Low");
            }
          }
        }
      }
      if (ts2.isBinaryExpression(n) && n.operatorToken.kind === ts2.SyntaxKind.EqualsToken && ts2.isPropertyAccessExpression(n.left) && n.left.getText(sf) === "document.documentElement.dir") {
        let options2 = function(x) {
          if (ts2.isStringLiteral(x)) return [x.text];
          if (ts2.isParenthesizedExpression(x) || ts2.isAsExpression(x)) return options2(x.expression);
          if (ts2.isConditionalExpression(x)) {
            const a2 = options2(x.whenTrue), b = options2(x.whenFalse);
            return a2 && b ? [...a2, ...b] : void 0;
          }
          return void 0;
        };
        var options = options2;
        const values = options2(n.right), a = anchor2(n);
        if (values?.includes("rtl")) rtl.push(a);
        if (!values) {
          diagnostics.push({ path, range: a.range, code: "RUNTIME_DIRECTION_UNKNOWN", message: "Document direction expression not statically resolved.", impact: "DIRECTIONAL_UNSUPPORTED", blocking: true, rationale: "Potential output direction cannot be correlated safely." });
          add("RTL.RUNTIME.DIRECTION_UNKNOWN", "Dynamic document direction requires review", a, "RUNTIME_CONFIG", "Direction output comes from an unresolved expression.", "Review output values and runtime synchronization; do not infer direction from strings in a condition.", "document-runtime", [], "Low");
        }
      }
      if (ts2.isJsxOpeningElement(n) || ts2.isJsxSelfClosingElement(n)) {
        const name = n.tagName.getText(sf), binding = imports.get(name) ?? "";
        const a = () => anchor2(n, ctx2(n) + "/" + name);
        if (binding.endsWith(":ThemeProvider")) providers.push(a());
        if (binding.startsWith("@mui/icons-material") && /[/:](ArrowForward|ArrowBack|ChevronLeft|ChevronRight|KeyboardArrowLeft|KeyboardArrowRight|NavigateBefore|NavigateNext)(:|$)/.test(binding)) add("RTL.ICON.PROGRESSION", "Directional icon requires semantic review", a(), "MANUAL_REVIEW", "Imported directional icon renders in JSX; navigation meaning and appropriate orientation need review.", "Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring.", "custom-icon", [], "Medium");
        if (binding === "@mui/material:Pagination") add("RTL.RUNTIME.PAGINATION", "Pagination direction depends on MUI theme", a(), "RUNTIME_CONFIG", "MUI supplies directional pagination roles through theme context, independently of HTML flow.", "Verify synchronized theme/cache/document setup before adding custom icon swaps.", policy.generatedStyleOwner ?? "unknown", [], "Medium");
        if (binding === "@mui/material:TableCell" && !n.attributes.properties.some((p) => ts2.isJsxAttribute(p) && p.name.getText(sf) === "align")) add("RTL.TABLE.ALIGNMENT", "Table cell has no explicit alignment policy", a(), "MANUAL_REVIEW", "Generated default alignment and content-specific alignment policy are not declared at this cell.", "Review text, numeric and token alignment with runtime configuration; absence of align alone is not a bug.", policy.generatedStyleOwner ?? "unknown", [], "Medium");
        if (binding === "@mui/material:TextField") add("RTL.FORM.DIRECTION", "Field geometry delegates to runtime styling", a(), "RUNTIME_CONFIG", "MUI field labels/notches/helpers depend on theme and generated style processing.", "Verify document/theme/cache coordination and native input behavior; do not patch vendor geometry.", policy.generatedStyleOwner ?? "unknown", [], "Medium");
        if (name === "svg" && ts2.isJsxElement(n.parent)) {
          let check2 = function(x) {
            if (ts2.isJsxAttribute(x) && x.name.getText(sf) === "className" && x.initializer && ts2.isStringLiteral(x.initializer)) {
              const classNames = x.initializer.text.split(/\s+/);
              for (const e of evidence) if (e.mechanism === "css" && classNames.some((c) => e.context.endsWith("/." + c)) && e.property === "display" && e.value === "flex") labels.push(x);
            }
            ts2.forEachChild(x, check2);
          };
          var check = check2;
          const parent = n.parent;
          let host = parent.parent;
          if (!ts2.isJsxElement(host)) host = parent;
          const labels = [];
          check2(host);
          if (labels.length && parent.getText(sf).includes("<path")) {
            const ar = a();
            const refs = evidence.filter((e) => labels.some((l) => ts2.isJsxAttribute(l) && l.initializer && ts2.isStringLiteral(l.initializer) && e.context.endsWith("/." + l.initializer.text)));
            add("RTL.CHART.LABEL_FLOW", "SVG geometry with separate flex labels", ar, "MANUAL_REVIEW", "Fixed SVG geometry and separate HTML flex labels can respond differently to document direction.", "Review chronology, axis gutters, labels/data correspondence and accessible description together.", "manual-chart", refs, "Medium", "Major");
          }
        }
        const classAttr = n.attributes.properties.find((p) => ts2.isJsxAttribute(p) && p.name.getText(sf) === "className");
        if (classAttr && ts2.isJsxAttribute(classAttr) && classAttr.initializer && ts2.isStringLiteral(classAttr.initializer)) {
          const role = policy.roles.find((r) => r.kind === "brand" && r.path === path && classAttr.initializer && ts2.isStringLiteral(classAttr.initializer) && classAttr.initializer.text.split(/\s+/).includes(r.className));
          if (role && !n.attributes.properties.some((p) => ts2.isJsxAttribute(p) && p.name.getText(sf) === "dir")) {
            const refs = evidence.filter((e) => e.mechanism === "css" && e.context.endsWith("/." + role.className) && e.property === "display" && e.value === "flex");
            if (refs.length) add("RTL.BRAND.ISLAND", "Brand flex composition has no explicit direction island", a(), "MANUAL_REVIEW", "Reviewed brand role uses inherited flex flow with separate visual children and no local direction contract.", "Preserve the approved wordmark composition as a reviewed island; do not mirror glyphs.", "manual-brand", refs, "Medium");
          }
        }
      }
      if (ts2.isJsxText(n) && /[→←]/.test(n.getText(sf)) || ts2.isStringLiteral(n) && /[→←]/.test(n.text) && (ts2.isCallExpression(n.parent) || ts2.isJsxExpression(n.parent)) && (() => {
        let p = n.parent;
        while (p) {
          if (ts2.isJsxExpression(p)) return true;
          p = p.parent;
        }
        return false;
      })()) add("RTL.ICON.LITERAL", "Literal directional arrow in rendered-copy call", anchor2(n), "MANUAL_REVIEW", "A literal arrow occurs in a copy/function call; its progression meaning and translated rendering need review.", "Review copy and navigation semantics rather than replacing every arrow.", "custom-copy", [], "Medium");
      if (ts2.isJsxExpression(n) && n.expression && !isolated2(n)) {
        let token2 = function(x) {
          if (ts2.isPropertyAccessExpression(x) && ["name", "address", "email", "id"].includes(x.name.text)) candidate = true;
          if (ts2.isCallExpression(x) && ts2.isIdentifier(x.expression) && imports.get(x.expression.text)?.endsWith(":money")) candidate = true;
          ts2.forEachChild(x, token2);
        };
        var token = token2;
        let candidate = false;
        token2(n.expression);
        const direct = ts2.isPropertyAccessExpression(n.expression) && ["name", "address", "email", "id"].includes(n.expression.name.text) || ts2.isCallExpression(n.expression) && ts2.isIdentifier(n.expression.expression) && imports.get(n.expression.expression.text)?.endsWith(":money");
        if (candidate && direct && (ts2.isJsxElement(n.parent) || ts2.isJsxFragment(n.parent)) && !ts2.isJsxElement(n.expression) && !ts2.isConditionalExpression(n.expression) && !ts2.isBinaryExpression(n.expression)) add("RTL.BIDI.ISOLATION", "Unisolated token/content text sink", anchor2(n), "MANUAL_REVIEW", "Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.", "Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.", "manual-content", [], "Medium");
      }
      if (ts2.isNewExpression(n) && n.expression.getText(sf) === "Intl.NumberFormat" && n.arguments?.[0] && ts2.isStringLiteral(n.arguments[0])) add("RTL.RUNTIME.LOCALE", "Fixed locale formatter", anchor2(n), "RUNTIME_CONFIG", "Formatting uses a fixed display locale; direction and locale formatting are separate contracts.", "Approve locale display policy separately from canonical currency/date values and bidi isolation.", "locale-runtime", [], "High");
      ts2.forEachChild(n, visit2);
    };
    var importsVisit = importsVisit2, ctx = ctx2, identity = identity2, anchor = anchor2, isolated = isolated2, visit = visit2;
    const sf = ts2.createSourceFile(path, text, ts2.ScriptTarget.Latest, true, path.endsWith("x") ? ts2.ScriptKind.TSX : ts2.ScriptKind.TS);
    const runtimeProofs = analyzeRuntimeDirection(sf);
    const provenThemes = new Set(runtimeProofs.flatMap((p) => p.themeDirections));
    const imports = /* @__PURE__ */ new Map();
    importsVisit2(sf);
    visit2(sf);
  }
  for (const e of evidence.filter((e2) => e2.mechanism === "html-root" && e2.property === "dir")) add("RTL.DOCUMENT.INITIAL", "Initial HTML direction", e, "INFORMATIONAL", "Initial HTML direction is a source fact, not the client runtime direction.", "Preserve approved default English markup; evaluate runtime direction separately.", "document-runtime", [e], "High", "Info");
  for (const a of rtl.filter((a2) => a2.context !== "html")) add("RTL.DOCUMENT.RUNTIME", "Document-level RTL assignment exists", a, "INFORMATIONAL", "Document root direction can switch to RTL; body-mounted portals inherit root direction unless overridden.", "Verify portal computed direction independently; do not report a wrapper-only portal failure.", "document-runtime", [], "High", "Info");
  if (rtl.length && themes.length) {
    for (const a of themes) {
      const f = add("RTL.RUNTIME.MISMATCH", "RTL document capability with fixed LTR theme", a, "RUNTIME_CONFIG", "Analyzed source assigns document RTL while createTheme direction is fixed LTR. These are separate direction channels.", "Review reachable provider synchronization; MUI theme alone does not rewrite generated physical styles.", policy.generatedStyleOwner ?? "unknown", [], "High", "Major");
      f.relatedLocations.push(...rtl.map((a2) => ({ path: a2.path, range: a2.range })));
    }
  }
  if (rtl.length && providers.length && !caches.length) {
    for (const a of providers) add("RTL.RUNTIME.CACHE", "No owned Emotion cache found in analyzed provider scope", a, "RUNTIME_CONFIG", "The analyzed provider/import scope contains no CacheProvider despite document RTL capability; transitive cache packages do not establish configured RTL processing.", "Review compatible LTR/RTL style processing and custom-style ownership; absence is a scoped inference.", policy.generatedStyleOwner ?? "unknown", [], "Medium", "Minor", null, "External providers, re-exported cache wrappers and unscanned configuration may invalidate this absence inference.");
  }
  for (const [a, reasons] of cacheChecks) {
    diagnostics.push({ path: a.path, range: a.range, code: "CACHE_CONFIGURATION_UNRESOLVED", message: "CacheProvider configuration unresolved: " + reasons.join(" "), impact: "DIRECTIONAL_UNSUPPORTED", blocking: true, rationale: "Cache presence alone cannot establish generated RTL processing or ownership." });
    add("RTL.RUNTIME.CACHE_UNVERIFIED", "Emotion cache direction pipeline needs verification", a, "RUNTIME_CONFIG", "CacheProvider presence does not prove RTL plugin compatibility or exemption behavior.", "Review cache creation/plugins and ownership as a separate configuration contract.", policy.generatedStyleOwner ?? "unknown", [], "Low");
  }
  return findings.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.range.start.offset - b.range.start.offset || a.ruleId.localeCompare(b.ruleId, "en"));
}

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/policy-validation.ts
import ts3 from "typescript";

// ../enterprise-rtl-migration-lab-latest/tools/rtl-scanner/src/policy.ts
var emptyPolicy = { schemaVersion: 1, generatedStyleOwner: "unknown", ownership: {}, approvals: [], exceptions: [], issueBindings: [], dynamicExceptions: [], roles: [] };
export {
  detect,
  emptyPolicy,
  extractCss
};
