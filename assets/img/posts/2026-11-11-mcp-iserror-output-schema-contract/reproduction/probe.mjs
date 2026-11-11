import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { Client as V1Client } from 'mcp-v1/client';
import { Server } from 'mcp-v1/server';
import { InMemoryTransport } from 'mcp-v1/inMemory.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from 'mcp-v1/types.js';
import { Client as V2Client } from 'mcp-v2';

const cases = [
  { name: 'success-valid', result: { content: [{ type: 'text', text: 'Success' }], structuredContent: { value: 7 } }, expected: ['returned', 'returned'] },
  { name: 'success-invalid', result: { content: [{ type: 'text', text: 'Malformed success' }], structuredContent: { error: 'unavailable' } }, expected: ['threw', 'threw'] },
  { name: 'success-missing-structured', result: { content: [{ type: 'text', text: 'Missing structured payload' }] }, expected: ['threw', 'threw'] },
  { name: 'error-text-only', result: { isError: true, content: [{ type: 'text', text: 'Unavailable' }] }, expected: ['returned', 'returned'] },
  { name: 'error-structured-off-schema', result: { isError: true, content: [{ type: 'text', text: 'Unavailable' }], structuredContent: { error: 'unavailable' } }, expected: ['threw', 'returned'] },
  { name: 'error-structured-conforming', result: { isError: true, content: [{ type: 'text', text: 'Unavailable with conforming structured payload' }], structuredContent: { value: 0 } }, expected: ['returned', 'returned'] },
];
const tool = {
  name: 'controlled_output',
  description: 'Local synthetic test fixture; no external action or service.',
  inputSchema: { type: 'object', properties: { scenario: { type: 'string' } }, required: ['scenario'] },
  outputSchema: { type: 'object', properties: { value: { type: 'number' } }, required: ['value'], additionalProperties: false },
};
const rows = [];
async function runClient(ClientClass, label, index, discover) {
  const server = new Server({ name: 'controlled-fixture', version: '1.0.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [tool] }));
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const scenario = cases.find(item => item.name === request.params.arguments.scenario);
    assert(scenario, 'Unknown synthetic scenario');
    return structuredClone(scenario.result);
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new ClientClass({ name: 'independent-probe', version: '1.0.0' });
  await server.connect(serverTransport);
  try {
    if (index === 1) await client.connect(clientTransport, { prior: { kind: 'legacy' } });
    else await client.connect(clientTransport);
    if (discover) await client.listTools();
    const selected = discover ? cases : cases.filter(item => item.name === 'error-structured-off-schema');
    for (const scenario of selected) {
      let row;
      try {
        const result = await client.callTool({ name: tool.name, arguments: { scenario: scenario.name } });
        row = { client: label, discovery_performed: discover, scenario: scenario.name, outcome: 'returned', isError: result.isError === true, structuredContent: result.structuredContent ?? null };
      } catch (error) {
        row = { client: label, discovery_performed: discover, scenario: scenario.name, outcome: 'threw', error_code: error.code, error_message: error.message };
      }
      const expected = discover ? scenario.expected[index] : 'returned';
      assert.equal(row.outcome, expected, JSON.stringify(row));
      if (row.outcome === 'returned') {
        assert.equal(row.isError, scenario.result.isError === true);
        assert.deepEqual(row.structuredContent, scenario.result.structuredContent ?? null);
      } else {
        assert.equal(row.error_code, scenario.name === 'success-missing-structured' ? -32600 : -32602);
      }
      rows.push(row);
    }
  } finally {
    await client.close();
    await server.close();
  }
}
await runClient(V1Client, '@modelcontextprotocol/sdk@1.32.2', 0, true);
await runClient(V2Client, '@modelcontextprotocol/client@2.4.0', 1, true);
await runClient(V1Client, '@modelcontextprotocol/sdk@1.32.2', 0, false);
const output = { status: 'pass', node: process.version, platform: process.platform, arch: process.arch, network_used_for_scenarios: false, fixture: 'v1 low-level Server over linked in-memory transport; v2 prior.kind=legacy; synthetic payloads, not a live production server', assertions: 'all 13 outcome rows plus returned payload/error-code assertions matched', rows };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(output, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(output, null, 2));
