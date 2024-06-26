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
    const userByUsername: any = await authme.query().select('username').from('authme').where('username', user.username)
    const userByEmail: any = await authme.query().select('email').from('authme').where('email', user.email)
    return {
        usernameTaken: userByUsername.length > 0, //returns true or false
        emailTaken: userByEmail.length > 0 //retuurns true or false
    };
}

export default class UsersController {
    async create({ request, response }: HttpContext) {
        const body = request.body()
        const status = await userAlreadyExists(body)
        // Verify if user already exists on databases by username and email.
        if (status.emailTaken == true || status.usernameTaken == true) {
            console.log("User already exists, skipping")
            response.send(status)
            return status
        } else {
            body.password = await passwordHasher(body.password)
            body.regip = request.ip()
            console.log('Creating user')
            await authme
                .insertQuery()
                .table('authme')
                .insert(body)
        }

    }


    async listOnline({ response }: HttpContext) {
        let onlineUsers = await authme.query().select('username').from('authme').where('isLogged', 1)

        let filteredUsers = onlineUsers.map((user) => {
            return user.username
        })

        response.send(onlineUsers)
    }



}