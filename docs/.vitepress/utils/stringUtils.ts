export function getNested(obj: any, path: string): any {
  return path
    .split(".")
    .reduce((o, key) => (o && key in o ? o[key] : undefined), obj);
}

export function normalizePath(path: string): string {
  return (
    path
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "")
      .replace(/\/+$/, "") || "/"
  );
}
