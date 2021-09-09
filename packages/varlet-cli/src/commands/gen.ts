import logger from '../shared/logger'
import inquirer from 'inquirer'
import { resolve } from 'path'
import { copy, pathExistsSync, readFileSync, writeFileSync } from 'fs-extra'
import { CLI_PACKAGE_JSON, CWD, GENERATORS_DIR } from '../shared/constant'

function syncVersion(name: string) {
  const file = resolve(CWD, name, 'package.json')
  const pkg = JSON.parse(readFileSync(file, 'utf-8'))
  const cliPkg = JSON.parse(readFileSync(CLI_PACKAGE_JSON, 'utf-8'))
  pkg.devDependencies['@varlet/cli'] = `^${cliPkg.version}`
  writeFileSync(file, JSON.stringify(pkg, null, 2))
}

export async function gen(name: string) {
  const dest = resolve(CWD, name)
  if (pathExistsSync(dest)) {
    logger.warning(`${name} already exists and cannot be recreated...`)
    return
  }

  const ret = await inquirer.prompt([
    {
      name: 'Please select your component library programming style',
      type: 'list',
      choices: ['sfc', 'tsx'],
    },
  ])

  const choice = ret['Please select your component library programming style']
  const generator = resolve(GENERATORS_DIR, choice)
  await copy(generator, dest)
  syncVersion(name)

  logger.success('Application generated successfully!')
  logger.info(`\
  cd ${name}
  yarn
  yarn dev`)
  logger.success(`\
=======================
  Good luck have fun
=======================\
      `)
}
