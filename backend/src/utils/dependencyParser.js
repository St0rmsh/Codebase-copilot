const parsePackageJson = (content) => {
  try {
    const pkg = JSON.parse(content);
    const deps = [];
    const sections = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(sections)) {
      deps.push({ manifestFile: "package.json", ecosystem: "npm", name, version: String(version) });
    }
    return deps;
  } catch {
    return [];
  }
};

const parseRequirementsTxt = (content) => {
  const deps = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*([=<>!~]{1,2}=?\s*[\w.]*)?/);
    if (match) {
      deps.push({
        manifestFile: "requirements.txt",
        ecosystem: "pip",
        name: match[1],
        version: (match[2] || "").trim(),
      });
    }
  }
  return deps;
};

const parseGoMod = (content) => {
  const deps = [];
  const requireBlockMatch = content.match(/require\s*\(([\s\S]*?)\)/);
  const lines = requireBlockMatch
    ? requireBlockMatch[1].split("\n")
    : content.split("\n").filter((l) => l.trim().startsWith("require "));

  for (const line of lines) {
    const match = line.trim().match(/^(?:require\s+)?([^\s]+)\s+([^\s]+)/);
    if (match && !match[1].startsWith("//")) {
      deps.push({ manifestFile: "go.mod", ecosystem: "go", name: match[1], version: match[2] });
    }
  }
  return deps;
};

const parseCargoToml = (content) => {
  const deps = [];
  const depsSectionMatch = content.match(/\[dependencies\]([\s\S]*?)(\n\[|$)/);
  if (!depsSectionMatch) return deps;

  const lines = depsSectionMatch[1].split("\n");
  for (const line of lines) {
    const match = line.trim().match(/^([\w-]+)\s*=\s*"?([\w.]*)"?/);
    if (match) {
      deps.push({ manifestFile: "Cargo.toml", ecosystem: "cargo", name: match[1], version: match[2] || "" });
    }
  }
  return deps;
};

const parseCsproj = (content) => {
  const deps = [];
  const regex = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    deps.push({ manifestFile: "*.csproj", ecosystem: "nuget", name: match[1], version: match[2] });
  }
  return deps;
};

const parsePomXml = (content) => {
  const deps = [];
  const regex = /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*(?:<version>([^<]+)<\/version>)?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    deps.push({
      manifestFile: "pom.xml",
      ecosystem: "maven",
      name: `${match[1]}:${match[2]}`,
      version: match[3] || "",
    });
  }
  return deps;
};

// filePath -> parser function, matched by exact filename
const MANIFEST_PARSERS = {
  "package.json": parsePackageJson,
  "requirements.txt": parseRequirementsTxt,
  "go.mod": parseGoMod,
  "Cargo.toml": parseCargoToml,
  "pom.xml": parsePomXml,
};

export const isManifestFile = (fileName) => {
  return fileName in MANIFEST_PARSERS || fileName.endsWith(".csproj");
};

export const parseManifestFile = (fileName, content) => {
  if (fileName.endsWith(".csproj")) return parseCsproj(content);
  const parser = MANIFEST_PARSERS[fileName];
  return parser ? parser(content) : [];
};