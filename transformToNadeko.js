// Transforms spell.js into nadeko form
const fs = require('fs')
const yaml = require('js-yaml');
const spells = require('./spells.json')

const characters = spells.map(s => ({word: s.character}))

const allSpells = spells.flatMap(s => s.spells.map(spell => ({word: spell.translatedName})))


const writeJson = (filename, data) => fs.writeFileSync(`${filename}.json`, JSON.stringify(data, null, 2))
const writeYaml = (filename, data) => fs.writeFileSync(`${filename}.yaml`, yaml.dump(data))

writeJson('characters', characters)
writeYaml('characters', characters)

writeJson('only_spells', allSpells)
writeYaml('only_spells', allSpells)

