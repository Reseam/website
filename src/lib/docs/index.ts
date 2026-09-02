import raw from './generated/docs.json';
import type { DocsIndex } from './types.ts';

export const docs = raw as DocsIndex;
