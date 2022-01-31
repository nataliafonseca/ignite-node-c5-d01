export default {
  jwt: {
    secret: `${process.env.JWT_SECRET_KEY}`,
    expiresIn: '1d'
  }
}
