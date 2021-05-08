const Xray = require('x-ray');
const x = Xray();
const puppeteer = require('puppeteer-extra')

const fs = require('fs')

const urls = [
  'https://en.touhouwiki.net/wiki/List_of_Spell_Cards/Touhou_Project_1',
  'https://en.touhouwiki.net/wiki/List_of_Spell_Cards/Touhou_Project_2',
  'https://en.touhouwiki.net/wiki/List_of_Spell_Cards/Touhou_Project_3',
];



(async () => {

  const charSpells = []

  let browser;
  try {


    puppeteer.use(require('puppeteer-extra-plugin-stealth')())
    browser = await puppeteer.launch({ headless: true })


    await Promise.all(urls.map(async url => {

      const page = await browser.newPage();

      await page.goto(url)

      const characters = await page.$$eval("h2 .mw-headline", headlines => {
        return headlines.slice(0, -1).map(el => el.textContent)
      })

      const spells = await page.$$eval("table.wikitable.sortable.jquery-tablesorter", tables => {

        return Promise.all(tables.map(async (table) => {
          console.log(table.querySelectorAll('thead th'))

          const spells = Array.from(table.querySelectorAll('tbody tr')).slice(1).map(spellRow => {

            // 4th column
            const games = Array.from(spellRow.children[3].childNodes).
              filter(el => el.tagName !== "BR")
              .map(el => el.textContent.trim())
              .filter(s => s.length > 0)

            // 5th column
            const stages = Array.from(spellRow.children[4].childNodes).
              filter(el => el.tagName !== "BR")
              .map(el => el.textContent.trim())
              .filter(s => s.length > 0)

            // first column
            const originalName = spellRow.children[0].textContent.trim()
            // second column
            const translatedName = spellRow.children[1].textContent.trim()

            const locations = games.map((game, idx) => ({ game, stage: stages[idx] }))
            return {
              originalName,
              translatedName,
              locations,
            }


          })

          return spells;
        }))
      })

      const zipped = characters.map((character, idx) => ({
        character,
        spells: spells[idx]
      }))

      console.log({
        url,
        charCount: characters.length,
        spellCount: spells.length
      })

      charSpells.push(...zipped)


    }))

    await browser.close()

    charSpells.sort((a, b) =>  (a.character > b.character) ? 1 : -1)

    fs.writeFileSync('spells.json', JSON.stringify(charSpells, null, 2))

  } catch (err) {
    console.error(err)
  } finally {
    if (browser) {
      browser.close()
    }
  }
})()


