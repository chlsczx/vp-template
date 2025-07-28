export type Enabled = boolean | 0 | 1 | 2;

export type NavOverride = string;

export type DocsConfigValue =
  | string
  | [string]
  | [string, Enabled]
  | [string, NavOverride]
  | [string, Enabled, NavOverride]
  | { links: string; show: Enabled };

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
