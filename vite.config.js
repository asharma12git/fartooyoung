import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Directly load ONLY the specified mode env file
  const envFile = resolve(process.cwd(), `.env.${mode}`)
  let env = {}
  
  console.log(`\n🔧 Loading environment for mode: ${mode}`)
  console.log(`📁 Reading file: ${envFile}`)
  
  try {
    const envContent = readFileSync(envFile, 'utf-8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        env[key] = value
      }
    })
    console.log(`✅ Loaded VITE_API_BASE_URL: ${env.VITE_API_BASE_URL}`)
  } catch (e) {
    console.warn(`❌ No .env.${mode} file found`)
  }
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
    }
  }
})
