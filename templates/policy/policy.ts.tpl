export type {{NAME_PASCAL}}Config = {
  enabled: boolean;
};

export function {{NAME_CAMEL}}Policy(command: string, cfg: {{NAME_PASCAL}}Config) {
  if (!cfg.enabled) return;
  if (!command) return;
  return { block: false };
}
