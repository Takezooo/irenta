import bcrypt from "bcrypt";

export default {
  hash: (password) =>
    bcrypt
      .hash(password, 10)
      .then((hash) => {
        return hash;
      })
      .catch((err) => console.error(err.message)),
  compare: (password, hash) =>
    bcrypt
      .compare(password, hash)
      .then((res) => {
        return res;
      })
      .catch((err) => console.error(err.message)),
};
