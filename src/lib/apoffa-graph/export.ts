/**
 * Graph export utilities for APOffa.
 */

import { logger } from '@/lib/logger';
import type { EntityNode, EntityEdge, GraphExportOptions } from './ui-types';

const log = logger.child({ module: 'apoffa-graph:export' });

export function exportToJSON(nodes: EntityNode[], edges: EntityEdge[], options?: GraphExportOptions): string {
  log.info({ nodes: nodes.length, edges: edges.length }, 'Exporting JSON');
  return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), nodes: options?.includeMetadata !== false ? nodes : nodes.map(({ id, name, type }) => ({ id, name, type })), edges: options?.includeMetadata !== false ? edges : edges.map(({ id, source, target, type }) => ({ id, source, target, type })) }, null, 2);
}

export function exportToCSV(nodes: EntityNode[], edges: EntityEdge[]): { nodes: string; edges: string } {
  log.info({ nodes: nodes.length, edges: edges.length }, 'Exporting CSV');
  const nodeCSV = ['id,name,type,relevance', ...nodes.map(n => `${n.id},"${n.name.replace(/"/g, '""')}",${n.type},${n.relevance ?? ''}`)].join('\n');
  const edgeCSV = ['id,source,target,type,label', ...edges.map(e => `${e.id},${e.source},${e.target},${e.type},${e.label ?? ''}`)].join('\n');
  return { nodes: nodeCSV, edges: edgeCSV };
}

export function exportToGraphML(nodes: EntityNode[], edges: EntityEdge[]): string {
  log.info({ nodes: nodes.length, edges: edges.length }, 'Exporting GraphML');
  const nodeXML = nodes.map(n => `    <node id="${n.id}"><data key="name">${escapeXml(n.name)}</data><data key="type">${n.type}</data>${n.relevance ? `<data key="relevance">${n.relevance}</data>` : ''}</node>`).join('\n');
  const edgeXML = edges.map(e => `    <edge id="${e.id}" source="${e.source}" target="${e.target}"><data key="type">${e.type}</data>${e.label ? `<data key="label">${escapeXml(e.label)}</data>` : ''}</edge>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="all" attr.name="type" attr.type="string"/>
  <key id="relevance" for="node" attr.name="relevance" attr.type="double"/>
  <key id="label" for="edge" attr.name="label" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
${nodeXML}
${edgeXML}
  </graph>
</graphml>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
