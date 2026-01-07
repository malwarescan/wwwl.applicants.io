export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'Applicants.io'
  },
  header: {
    title: '',
    to: '/',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: []
  },
  footer: {
    credits: `Applicants.io • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: []
  },
  toc: {
    title: 'On This Page',
    bottom: {
      title: 'About',
      edit: undefined,
      links: [{
        label: 'About Applicants.io',
        to: '/about',
        icon: 'i-lucide-info'
      }]
    }
  }
})
