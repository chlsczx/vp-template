export function getNested(obj: any, path: string): any {
  return path
    .split(".")
    .reduce((o, key) => (o && key in o ? o[key] : undefined), obj);
}
