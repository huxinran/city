import { chromium } from 'playwright'

const b = await chromium.launch()
const p = await b.newPage()
await p.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 15000 })
await p.waitForTimeout(4000)

// Find tiles that have .building divs inside them
const buildingTiles = await p.locator('app-tile .building').all()
console.log('building divs found:', buildingTiles.length)

if (buildingTiles.length > 0) {
  const first = await buildingTiles[0].innerHTML()
  console.log('\nFIRST BUILDING inner HTML:\n', first.slice(0, 1200))
}

// check farm layout
const farmLayouts = await p.locator('.farm-layout').count()
const workshopLayouts = await p.locator('.workshop-layout').count()
const iconSlots = await p.locator('.icon-slot').count()
const farmHouses = await p.locator('.farm-house').count()
const farmProduce = await p.locator('.farm-produce').count()
console.log(`\nfarm-layout: ${farmLayouts}  workshop-layout: ${workshopLayouts}  icon-slot: ${iconSlots}`)
console.log(`farm-house: ${farmHouses}  farm-produce: ${farmProduce}`)

await p.screenshot({ path: 'C:/temp/city2.png' })
console.log('screenshot saved')
await b.close()
