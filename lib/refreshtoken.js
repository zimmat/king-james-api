export default async () => {
    const refresh_token = jwt.sign({id}, secret, { expiresIn: "1h" })
    let user = await new Promise((resolve) => {
      connection.query(`update users set refresh_token where email=?`,[refresh_token, email], async (error, res) => {
          if (error) throw error
          resolve(res[0])
      })
  })
    console.log({user})
    return refresh_token;
}