declare module "../build/main/core/config/field-configuration.js" {
    export function initializeFieldConfiguration(): void;
}

declare module "../build/main/main/init-mcp-server.js" {
    import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
    export function initMcpServer(username: string | undefined, password: string | undefined): McpServer;
}
