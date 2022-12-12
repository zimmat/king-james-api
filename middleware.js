import {connection} from './db'
import jwt from 'jsonwebtoken'

const secret = 'BEXEpdI3mqOTcI5gzePdpmXJHiAvBgmD'

export const ensureLoggedIn = async(req, res, next) => {
    try {
        const authorization = req.header('authorization');
        console.log({authorization})
        console.log("headers", req.headers)
        if (!authorization) throw { code: 401, message: 'Not Authorised' };
  
        const token = (authorization.split(" "))[1]
        if (!token) throw { code: 400, message: "Something wrong with token" }
  
        const decoded = jwt.verify(token, secret);
        console.log({decoded})

        const user = await new Promise((resolve) =>{
            connection.query(`select * from users where id=?`,[decoded.id], async (error, res) => {
            if (error) throw error
            resolve(res[0])
            })
        })
      
  
        req.user = user
        return next();
      } catch (ex) {
        console.error(`Middleware`, { error: ex.message });
        throw ex
      }
}

// const {authorization} = req.headers
// console.log({authorization})
// if (!authorization) {
//     const err = new Error('You are not authenticated!');
//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//     return next(err)
// }
// const auth = new Buffer.from(authorization.split(' ')[1],
// 'base64').toString().split(':');
// const email = auth[0];
// const password = auth[1];

// const user = await new Promise((resolve) =>{
//     connection.query(`select * from users where email=?`,[email], async (error, res) => {
//         if (error) throw error
//         resolve(res[0])
//     })
// })

// let isSame = await bcrypt.compare(password, user.password)
// if(!!isSame){
// req.user = user
//  next()
// } else {
//     const err = new Error('You are not authenticated!');
//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//     return next(err);
// }