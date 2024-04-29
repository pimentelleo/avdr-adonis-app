// import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

import { HttpContext } from '@adonisjs/core/http'
import auth from '@adonisjs/auth/services/main'

const authme = db.connection('authme')

const passwordHasher = async (password: string) => {
  let hashed = await hash.use('argon').make(password)
  return hashed
}


const userAlreadyExists = async (user: any) => {
  interface StatusObject {
    [key: string]: any
  }

  let userStatus: StatusObject = {
    usernameTaken: false,
    emailTaken: false
  };
  console.log(user)
  const userByUsername: any = await authme.query().select('*').from('authme').where('username', user.username)
  const userByEmail: any = await authme.query().select('*').from('authme').where('email', user.email)
  console.log(userByEmail)
  if (userByUsername[0].username == user.username) {
    userStatus.usernameTaken = true;
  }
  if (userByEmail[0].email == user.email) {
    userStatus.emailTaken = true;
  }

  return userStatus;
}

export default class UsersController {


  async create({ request, response }: HttpContext) {
    const body = request.body()
    const status = await userAlreadyExists(body)
    // Verify if user already exists on databases by username and email.
    if (status.emailTaken || status.usernameTaken) {
      console.log(status)
      response.send(status)
    } else {
      body.password = await passwordHasher(body.password)
      body.regip = request.ip()
      console.log('Creating user')
      console.log(body)
      await authme
        .insertQuery()
        .table('authme')
        .insert(body)


    }

  }


  async listOnline({ response }: HttpContext) {
    let onlineUsers = await authme.query().select('*').from('authme').where('isLogged', 1)

    let filteredUsers = onlineUsers.map((user) => {
      return user.username
    })

    response.send(filteredUsers)
  }



}