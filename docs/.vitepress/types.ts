export type DocsConfigValue =
  | string
  | [string]
  | [string, boolean]
  | { links: string; show: boolean };

export type DocsConfig = Record<string, DocsConfigValue>;

export type MdConfig = {
  priority: number;
  title?: string | undefined;
};

export type SidebarItem = {
  priority: number;
  text: string;
  link: string;
  items?: SidebarItem[] | undefined;
};