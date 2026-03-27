import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:4000/api'
    }
  },
  video: false,
  screenshotOnRunFailure: true
});
