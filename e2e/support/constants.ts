import path from 'node:path'

export const authStoragePath = path.join(__dirname, '..', '.auth', 'staff.json')

export function e2eCredentials() {
  return {
    email: process.env.E2E_EMAIL ?? 'admin@interview-app.com',
    password: process.env.E2E_PASSWORD ?? 'admin123',
  }
}
