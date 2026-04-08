import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// OSS signing proxy plugin
function ossProxy(): Plugin {
  let ossClient: any = null

  const getClient = async () => {
    if (ossClient) return ossClient
    const OSS = (await import('ali-oss')).default
    ossClient = new OSS({
      region: 'oss-cn-shanghai',
      accessKeyId: 'LTAI5t9dLA4XBngXqvVhBxq6',
      accessKeySecret: 'xa2BfnrGDwSyDOCgBFqfUraHGwBVzp',
      bucket: 'vibe01china',
    })
    return ossClient
  }

  return {
    name: 'oss-proxy',
    configureServer(server) {
      server.middlewares.use('/oss', async (req, res) => {
        try {
          const filePath = req.url?.replace(/^\//, '') || ''
          if (!filePath) { res.writeHead(400); res.end(); return }

          const client = await getClient()
          const signedUrl = client.signatureUrl(filePath, { expires: 3600 })
          res.writeHead(302, { Location: signedUrl })
          res.end()
        } catch (e: any) {
          console.error('[OSS Proxy]', e.message)
          res.writeHead(500)
          res.end(e.message)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ossProxy()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3300',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
