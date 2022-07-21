// const bcrypt = require('bcryptjs');

// var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync("angga", salt);

// bcrypt.compareSync("angga", hash); // true
// bcrypt.compareSync("not_bacon", hash); // false

// console.log(hash);
// console.log(bcrypt.compareSync("angga", hash));
// console.log(bcrypt.compareSync("angg", hash));

const {Shoe, Brand, User, Transactions, Profile} = require('./models') ;
Transactions.findOne({
    where: {
        ShoeId: 1
    }
})
    .then(t => console.log(t))
    .catch(err => console.log(err))