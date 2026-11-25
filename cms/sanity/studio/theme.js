import { buildTheme } from '@sanity/themer'

export const rapidLinkTheme = buildTheme({
  light: {
    accent: '#0831ff',
    text: '#102b46',
    background: '#f4f6fa',
    contrast: 94,
  },
  dark: {
    accent: '#ff7400',
    text: '#e8edf2',
    background: '#111827',
    contrast: 94,
  },
})
