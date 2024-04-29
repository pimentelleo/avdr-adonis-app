import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'bcrypt',

  list: {
    bcrypt: drivers.bcrypt({
      rounds: 10,
      saltSize: 22,
      version: 98
    }),
    argon: drivers.argon2({
      version: 0x13, // hex code for 19
      variant: 'id',
      iterations: 3,
      memory: 65536,
      parallelism: 4,
      saltSize: 16,
      hashLength: 96,
    })
  },
})

export default hashConfig

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> { }
}
