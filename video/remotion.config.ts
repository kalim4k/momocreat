// Reglages du studio (`npm run studio`). Le rendu (`npm run render`) applique les memes dans
// render.mjs.
import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

Config.overrideWebpackConfig((config) => enableTailwind(config));
