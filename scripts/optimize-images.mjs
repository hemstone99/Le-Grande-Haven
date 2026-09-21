import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const roots = ['public', 'src']
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const maxDimension = 2400

async function imageFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const filePath = path.join(root, entry.name)
    if (entry.isDirectory()) files.push(...await imageFiles(filePath))
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(filePath)
  }
  return files
}

async function optimize(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  const source = await fs.readFile(filePath)
  const image = sharp(source, { failOn: 'none' }).rotate().resize({
    width: maxDimension,
    height: maxDimension,
    fit: 'inside',
    withoutEnlargement: true,
  })

  const output = extension === '.png'
    ? await image.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true }).toBuffer()
    : extension === '.webp'
      ? await image.webp({ quality: 82, effort: 5 }).toBuffer()
      : await image.jpeg({ quality: 80, mozjpeg: true }).toBuffer()

  if (output.length < source.length) await fs.writeFile(filePath, output)
  return { before: source.length, after: output.length, changed: output.length < source.length }
}

const files = (await Promise.all(roots.map(imageFiles))).flat()
let before = 0
let after = 0
let changed = 0

for (const filePath of files) {
  const result = await optimize(filePath)
  before += result.before
  after += result.changed ? result.after : result.before
  if (result.changed) changed += 1
}

console.log(`Optimized ${changed}/${files.length} images`)
console.log(`Size: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`)
console.log(`Saved: ${((1 - after / before) * 100).toFixed(1)}%`)