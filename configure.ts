/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  await codemods.defineEnvVariables({
    AUTHENTIK_CLIENT_ID: '',
    AUTHENTIK_CLIENT_SECRET: '',
    AUTHENTIK_CALLBACK_URL: '',
    AUTHENTIK_AUTHORIZE_URL: '',
    AUTHENTIK_ACCESSTOKEN_URL: '',
    AUTHENTIK_USERINFO_URL: '',
  })

  await codemods.defineEnvValidations({
    variables: {
      AUTHENTIK_CLIENT_ID: 'Env.schema.string()',
      AUTHENTIK_CLIENT_SECRET: 'Env.schema.string()',
      AUTHENTIK_CALLBACK_URL: 'Env.schema.string()',
      AUTHENTIK_AUTHORIZE_URL: 'Env.schema.string()',
      AUTHENTIK_ACCESSTOKEN_URL: 'Env.schema.string()',
      AUTHENTIK_USERINFO_URL: 'Env.schema.string()',
    },
    leadingComment: 'Variables for @jvvan/adonis-ally-authentik',
  })
}
