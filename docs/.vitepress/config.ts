import { cp } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'vitepress';

const ASSETS_DIR = 'assets';

export default defineConfig({
  title: 'bunito',
  description: 'A Bun-first TypeScript framework for modular applications.',
  appearance: 'force-dark',
  buildEnd: async (config) => {
    await cp(join(config.srcDir, ASSETS_DIR), join(config.outDir, ASSETS_DIR), {
      recursive: true,
      errorOnExist: false,
    });
  },
  themeConfig: {
    logo: `/${ASSETS_DIR}/logo.png`,
    logoLink: 'https://bunito.dev',

    nav: [
      { text: 'Getting Started', link: '/' },
      { text: 'Overview', link: '/overview' },
      { text: 'CLI', link: '/cli' },
      { text: 'Techniques', link: '/techniques/modules-and-providers' },
      { text: 'Tutorials', link: '/tutorials/basics' },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/bunito-dev' }],

    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'Getting Started', link: '/' },
          { text: 'Overview', link: '/overview' },
          { text: 'CLI', link: '/cli' },
        ],
      },
      {
        text: 'Techniques',
        items: [
          { text: 'Modules And Providers', link: '/techniques/modules-and-providers' },
          {
            text: 'Configuration And Logging',
            link: '/techniques/configuration-and-logging',
          },
          { text: 'HTTP', link: '/techniques/http' },
        ],
      },
      {
        text: 'Tutorials',
        items: [
          { text: 'Basics', link: '/tutorials/basics' },
          { text: 'Simple Controller', link: '/tutorials/simple-controller' },
          { text: 'JSON Middleware', link: '/tutorials/json-middleware' },
          { text: 'Multiple APIs', link: '/tutorials/multiple-apis' },
        ],
      },
    ],
  },
});
