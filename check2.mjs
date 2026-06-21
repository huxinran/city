import { chromium } from 'playwright'

const b = await chromium.launch({ headless: true })
const p = await b.newPage()

await p.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 15000 })
await p.waitForTimeout(3000)

// Find all app-tile elements that are grass (not sea, and not covered)
const tileSel = 'app-tile:not([style*="display: none"])'
const tiles = await p.locator(tileSel).all()
console.log('visible tiles:', tiles.length)

// Check palette buttons
const palBtns = await p.locator('button.pal-icon').all()
console.log('palette buttons:', palBtns.length)
for (const btn of palBtns.slice(0, 6)) {
  const title = await btn.getAttribute('title')
  console.log('  btn title:', title)
}

// Click House button
const houseBtn = p.locator('button.pal-icon[title="House"]')
const houseCount = await houseBtn.count()
console.log('House button found:', houseCount)
if (houseCount > 0) {
  await houseBtn.click()
  await p.waitForTimeout(300)
}

// Find a grass tile and click it
// The grass tiles will have a green background gradient
if (tiles.length > 0) {
  // Try tiles near the center
  for (const tile of tiles.slice(Math.floor(tiles.length / 2), Math.floor(tiles.length / 2) + 10)) {
    try {
      const box = await tile.boundingBox()
      if (box && box.x > 200 && box.y > 60) {
        await tile.click({ timeout: 2000 })
        await p.waitForTimeout(300)
        break
      }
    } catch(e) { }
  }
}

await p.waitForTimeout(500)

const buildings = await p.locator('app-tile .building').count()
console.log('\nbuildings after click:', buildings)

if (buildings > 0) {
  const html = await p.locator('app-tile .building').first().innerHTML()
  console.log('first building HTML:', html.slice(0, 600))
}

// Try placing wheat farm
const wheatBtn = p.locator('button.pal-icon[title="Wheat Farm"]')
if (await wheatBtn.count() > 0) {
  await wheatBtn.click()
  await p.waitForTimeout(300)
  for (const tile of tiles.slice(100, 115)) {
    try {
      const box = await tile.boundingBox()
      if (box && box.x > 200 && box.y > 60) {
        await tile.click({ timeout: 2000 })
        await p.waitForTimeout(300)
        break
      }
    } catch(e) { }
  }
}

await p.waitForTimeout(500)
const farmsAfter = await p.locator('.farm-layout').count()
const iconSlots = await p.locator('.icon-slot').count()
console.log(`farms: ${farmsAfter}  icon-slots: ${iconSlots}`)

await p.screenshot({ path: 'C:/temp/city3.png' })
console.log('screenshot saved')
await b.close()
