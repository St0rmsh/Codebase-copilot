// Compares old vs new file lists (from repo.files before/after re-clone) to find what changed
export const diffFileLists = (oldFiles, newFiles) => {
  const oldMap = new Map(oldFiles.map((f) => [f.path, f.size]));
  const newMap = new Map(newFiles.map((f) => [f.path, f.size]));

  const added = [];
  const modified = [];
  const deleted = [];

  for (const [path, size] of newMap) {
    if (!oldMap.has(path)) {
      added.push(path);
    } else if (oldMap.get(path) !== size) {
      modified.push(path);
    }
  }

  for (const path of oldMap.keys()) {
    if (!newMap.has(path)) {
      deleted.push(path);
    }
  }

  return { added, modified, deleted, changedPaths: [...added, ...modified] };
};