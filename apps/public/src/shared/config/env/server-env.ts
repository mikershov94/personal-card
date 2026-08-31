import 'server-only';

import { parseServerEnv } from './parse-server-env';

export function getServerEnv() {
    return parseServerEnv(process.env);
}
