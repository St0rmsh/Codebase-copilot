export const buildFileTree = (files) => {
  const tree = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let node = tree;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      if (isFile) {
        node[part] = { __isFile: true, path: file.path, extension: file.extension, size: file.size };
      } else {
        node[part] = node[part] || { __isFile: false, children: {} };
        node = node[part].children;
      }
    });
  });

  return tree;
};