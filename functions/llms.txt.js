// Serves the built /llms.txt with blog entries that are not out yet removed (see functions/_lib/gate.js).
import { gated } from './_lib/gate.js';
export const onRequest = gated;
