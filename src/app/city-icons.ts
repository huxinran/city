import { CityName } from './types'

// Coat-of-arms PNG for each city, shown in the top-bar city picker.
const CITY_CREST_BASE = 'assets/used/coat-of-arms/'
const CITY_CREST_FILES: { [key: string]: string } = {
  [CityName.ANRELIA]:  'anrelia.png',   // CENTER — blue
  [CityName.MINTAKA]:  'mintaka.png',   // NORTH  — white
  [CityName.JINLIN]:   'jinlin.png',    // EAST   — green
  [CityName.COLUMBIA]: 'columbia.png',  // WEST   — red
  [CityName.SOLARA]:   'solara.png',    // SOUTH  — yellow
}

// PNG URL for a city's coat of arms, or undefined if no art exists.
export function GetCityCrestSrc(name: string): string | undefined {
  const file = CITY_CREST_FILES[name]
  return file ? `${CITY_CREST_BASE}${file}` : undefined
}
