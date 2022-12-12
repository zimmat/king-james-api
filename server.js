import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import sessions from 'express-session';
import cors from 'cors';
import {connection} from './db'
import bcrypt from'bcrypt';

import { ensureLoggedIn } from './middleware.js';
import jwt from 'jsonwebtoken'

const secret = 'BEXEpdI3mqOTcI5gzePdpmXJHiAvBgmD'

const saltRounds = 10;
const app = express()
const port = 3005

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`King James API`)
})
app.get('/my-profile', ensureLoggedIn, (req, res) => {
  try {
    const { id } = req.user
    connection.query('select * from users where id=?', [id],function (err, result) {
      if (err) throw err
      res.status(200).send(JSON.stringify(result))
    });
  } catch (error) {
    throw error
  }
  })
  app.get('/users', ensureLoggedIn, async(req, res) => {
    try { 
      const { role_id } = req.user
      if (role_id !== 1) {
        res.status(501).send("Unauthorised")
      } else {
        connection.query('select u.email, ur.title as role from users as u inner join user_roles as ur on ur.id = u.role_id',function (err, result) {
          if (err) throw err
          res.status(200).send({users:result})
        });
      }
    } catch (error) {
      throw error
    }
  })

  app.post('/update-profile', ensureLoggedIn, async (req, res) => {
    try {
      const { id } = req.user
      const {email, password, role_id} = req.query
      let hash = await bcrypt.hash(password, saltRounds).then(r => r)
      const input = {email, password: hash, role_id}
      connection.query('update users set? where id=?', [input, id])
      connection.end();
     return res.status(200).send("User successfully added")  
    } catch (error) {
      throw error
    }
  })

app.post('/add-user',ensureLoggedIn, async (req, res) => {
  try {
    const {email, password, role_id} = req.query
    let hash = await bcrypt.hash(password, saltRounds).then(r => r)
    const refresh_token = jwt.sign({ email }, secret);

    const input = {email, password: hash, role_id, refresh_token}
    if (req.user.role_id !== 1) return res.status(501).send("Unauthorised to add user, not an admin");
        connection.query('INSERT INTO USERS SET?', input)
          connection.end();
    return res.status(200).send("User successfully added")
  } catch (error) {
    throw error
  }
})

app.post('/login', async (req, res) => {
  const {email, password} = req.body
  let user = await new Promise((resolve) => {
    connection.query(`select * from users where email=?`,[email], async (error, res) => {
        if (error) throw error
        resolve(res[0])
    })
})
  if(!user) throw { code: 401, message: `Invalid Credentials`}

  let isSame = await bcrypt.compare(password, user.password)
  if(!isSame) throw { code: 401, message: `Invalid Credentials`}
  const now = new Date()
  const expires_at = now.setHours(now.getHours() + 1);
  const token = jwt.sign({id: user.id}, secret)
  user = {...user, expires_at, token}
  req.user = user
  return res.status(200).send(user)
})

app.post('auth/refresh', async(req,res) => {
  try {
  const { id } = req.body
  const refresh_token = jwt.sign({id}, secret, { expiresIn: "1h" })
    let user = await new Promise((resolve) => {
      connection.query(`update users set refresh_token where email=?`,[refresh_token, email], async (error, res) => {
          if (error) throw error
          resolve(res[0])
      })
  })
  req.user = user
    return refresh_token;
  } catch (ex) {
    log.error(`${tag} :: getRefreshToken`, { id, error: ex.message });
    throw ex;
  }

})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})