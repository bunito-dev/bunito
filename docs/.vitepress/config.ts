import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'bunito',
  description: 'A Bun-first TypeScript framework for modular applications.',
  appearance: 'force-dark',

  themeConfig: {
    logo: '/assets/logo.png',
    logoLink: '/',

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
