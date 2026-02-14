#!/usr/bin/env bun

import { build } from 'bun'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const distDir = 'dist'

// Ensure dist directory exists
await mkdir(distDir, { recursive: true })

// Build JavaScript files
console.log('🔨 Building JavaScript files...')

const jsFiles = [
  {
    entry: 'public/js/config.js',
    output: 'js/config.js',
  },
  {
    entry: 'public/js/index.js',
    output: 'js/index.js',
  },
  {
    entry: 'public/js/responsive.js',
    output: 'js/responsive.js',
  },
]

for (const file of jsFiles) {
  console.log(`  Building ${file.entry}...`)

  await build({
    entrypoints: [file.entry],
    outdir: join(distDir, 'js'),
    minify: true,
    target: 'browser',
    sourcemap: true,
    format: 'esm',
  })
}

// Copy and process CSS
console.log('🎨 Processing CSS files...')
await mkdir(join(distDir, 'css'), { recursive: true })

const cssFiles = [
  'public/css/core.css',
  'public/css/index.css',
  'public/css/components.css',
  'public/css/conversions.css',
]

for (const cssFile of cssFiles) {
  const content = await Bun.file(cssFile).text()
  const minified = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Minify whitespace
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .trim()

  const filename = cssFile.split('/').pop()
  await writeFile(join(distDir, 'css', filename), minified)
  console.log(`  Processed ${filename}`)
}

// Copy static assets
console.log('📁 Copying static assets...')
await mkdir(join(distDir, 'assets'), { recursive: true })

const assetFiles = ['public/assets/kross-node.svg', 'public/assets/kross-node.webp']

for (const asset of assetFiles) {
  const content = await Bun.file(asset).arrayBuffer()
  const filename = asset.split('/').pop()
  await Bun.write(join(distDir, 'assets', filename), content)
  console.log(`  Copied ${filename}`)
}

// Copy HTML files and process them
console.log('📄 Processing HTML files...')
const htmlFiles = [
  'public/index.html',
  'public/en/agency.html',
  'public/en/solo.html',
  'public/ru/agency.html',
  'public/ru/solo.html',
  'public/404.html',
]

for (const htmlFile of htmlFiles) {
  let content = await Bun.file(htmlFile).text()

  // Update asset paths to use minified versions
  content = content
    .replace(/\/js\/config\.js/g, '/js/config.js')
    .replace(/\/js\/index\.js/g, '/js/index.js')
    .replace(/\/js\/responsive\.js/g, '/js/responsive.js')

  // Add integrity hashes for security
  const configHash = await Bun.hash(await Bun.file('dist/js/config.js').text())
  const indexHash = await Bun.hash(await Bun.file('dist/js/index.js').text())

  content = content
    .replace(
      '<script src="/js/config.js" defer>',
      `<script src="/js/config.js" defer integrity="sha256-${configHash}" crossorigin="anonymous">`
    )
    .replace(
      '<script src="/js/index.js" defer>',
      `<script src="/js/index.js" defer integrity="sha256-${indexHash}" crossorigin="anonymous">`
    )

  const outputPath = htmlFile.replace('public/', distDir + '/')
  await mkdir(outputPath.split('/').slice(0, -1).join('/'), { recursive: true })
  await writeFile(outputPath, content)

  const filename = htmlFile.split('/').pop()
  console.log(`  Processed ${filename}`)
}

console.log('✅ Build completed successfully!')
console.log(`📦 Output directory: ${distDir}`)
console.log('🚀 Run "bun run preview" to test the build')
