export type A2aEnforcementConfig = {
  enabled: boolean;
};

export function a2aEnforcementPolicy(command: string, cfg: A2aEnforcementConfig) {
  if (!cfg.enabled) return;
  if (!command) return;
  return { block: false };
}
