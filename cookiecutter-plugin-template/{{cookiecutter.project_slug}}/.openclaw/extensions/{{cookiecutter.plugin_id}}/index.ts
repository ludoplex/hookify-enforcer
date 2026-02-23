export default function register(api: any) {
  api.registerHook(
    "before_tool_call",
    (event: { toolName: string; params: Record<string, unknown> }) => {
      if (event.toolName !== "exec") return;
      const cmd = typeof event.params.command === "string" ? event.params.command : "";
      if (!cmd) return;
    },
    { name: "{{ cookiecutter.plugin_id }}-before-tool-call", priority: 1000 }
  );
}
