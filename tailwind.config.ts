import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'excel-green': '#217346',
        'excel-green-light': '#2d8654',
        'excel-green-dark': '#1a5a35',
      },
    },
  },
  plugins: [],
}
export default config



