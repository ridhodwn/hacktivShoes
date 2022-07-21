const {Shoe, Brand, User, Transactions, Profile} = require('../models') ;
const { Op, Model } = require("sequelize");
const bcrypt = require('bcryptjs');
const {priceToRupiah, dateFormatter} = require('../helpers/helper') ;
const printInvoice = require('../invoices/index')

class Controller {
    static home(req, res){
        const role = req.session.role
        res.render('home', {role})
    }

    static brandList(req, res){
        Brand.findAll({
            order: [['id', 'ASC']]
        })
            .then(brands => {
                const brandsData = brands.map(el => {
                    const {id, name} = el ;
                    return {id, name}
                })
                return res.render('brandList', {brandsData})
            })
            .catch(err => res.send(err))
    }

    static shoeList(req, res){
        const {search, error, emptyList} = req.query ;
        const role = req.session.role
        let option = {
            order: [['id', 'asc']],
            attributes: {
                include: ["id", "name", "photo", "price", "stock"]
            },
            include: {
                model: Brand
            },
            where : {}
        }
        if(!emptyList){
            option.where = {...option.where, 
                stock:{
                    [Op.gt]: 0
                }
            }
        } else {
            option.where = {...option.where, 
                stock:{
                    [Op.eq]: 0
                }
            }
        }
        if(search){
            option.where = {...option.where, 
                name:{
                    [Op.iLike]: `%${search}%`
                }
            }
        }
        Shoe.findAll(option)
            .then(shoes => {
                const shoesData = shoes.map(el => {
                    const {id, name, photo, price, Brand, stock} = el ;
                    return {id, name, photo, price: priceToRupiah(price), Brand, stock}
                })
                return res.render('shoeList', {shoesData, error, role})
            })
            .catch(err => {
                console.log(err);
            })
    }

    static buyShoe(req, res){
        const {id} = req.params ;
        const userId = req.session.userId ;
        let isFound = false ;
        let previousAmount = 0
        Shoe.findOne({
            where : {
                id: +id
            },
            attributes: ['stock']
        })
            .then(shoe => {
                const {stock} = shoe ;
                let newStock = stock - 1 ;
                return Shoe.update({
                    stock: +newStock
                },{
                    where: {
                        id: +id
                    }
                })
            })
            .then(() => {
                return Transactions.findOne({
                    where: {
                        ShoeId: +id
                    }
                })
            })
            .then(transaction => {
                if(!transaction){
                    return Transactions.create({
                        ShoeId: id,
                        UserId: userId,
                        amount: 1
                    })
                } else {
                    isFound = true ;
                    return Transactions.findOne({
                        where : {
                            ShoeId: +id
                        },
                        attributes: ['id', 'amount']
                    })
                }
            })
            .then(transaction => {
                if(!isFound){
                    return res.redirect('/shoes')
                } else {
                    const {id, amount} = transaction
                    previousAmount = amount ;
                    let newAmount = previousAmount + 1 ;
                    return Transactions.update({
                        amount: newAmount
                    },{
                        where:{
                            id: +id
                        }
                    })
                }
            })
            .then(() => res.redirect('/shoes'))
            .catch(err => {
                console.log(err);
            })
    }

    static shoesByBrand(req, res){
        const{id} = req.params ;
        Brand.findOne({
            where: {
                id: +id
            },
            include: {
                model: Shoe,
            }
        })
            .then(brand => {
                const {id, name, Shoes} = brand ;
                const brandData = {id, name} ;
                const shoesData = Shoes.map(el => {
                    const {id, name, photo, price, stock} = el ;
                    return {id, name, photo, price: priceToRupiah(price), stock}
                })
                return res.render('shoeByBrand', {brandData, shoesData});
            })
            .catch(err => res.send(err))
    }

    static shoeDetail(req, res){
        const {id} = req.params
        Shoe.findOne({
            where:{
                id:+id
            },
            include: {
                model: Brand
            }
        })
            .then(shoe => {
                console.log(shoe);
                const { id, name, photo, usedBy, description, price, Brand} = shoe ;
                const shoeData = { id, name, photo, usedBy, description, price, Brand} ;
                return res.render('shoeDetail', {shoeData, Brand})
            })
            .catch(err => res.send(err))
    }

    static addNewShoe(req, res){
        const {error} = req.query ;
        Brand.findAll({
            order: [['id', 'ASC']]
        })
            .then(brands => {
                const brandsData = brands.map(el => {
                    const {id, name} = el ;
                    return {id, name}
                })
                return res.render('addNewShoeForm', {brandsData, error})
            })
            .catch(err => res.send(err))
    }

    static saveAddedShoe(req, res){
        const {name, usedBy, description, photo, price, stock, BrandId} = req.body ;
        const input = {name, usedBy, description, photo, price, stock, BrandId} ;
        Shoe.create(input)
            .then(() => res.redirect('/shoes')) 
            .catch(err => {
                if(err.name === "SequelizeValidationError"){
                    const errors = err.errors.map(el => {
                        return el.message ;
                    })
                    res.redirect(`/shoes/add?error=${errors.join(';')}`)
                } else {
                    res.send(err)
                }
            })
    }

    static register(req, res){
        const {error} = req.query
        return res.render('registerForm', {error})
    }

    static postRegister(req, res){
        const {username, email, password, role} = req.body ;
        const input = {username, email, password, role} ;
        User.create(input)
            .then(() => res.redirect('/shoes'))
            .catch(err => {
                if(err.name === "SequelizeValidationError"){
                    const errors = err.errors.map(el => {
                          return el.message ;
                      })
                      res.redirect(`/register?error=${errors.join(';')}`)
                  } else {
                      res.send(err)
                  }
            })
    }

    static login(req, res){
        const {error} = req.query ;
        return res.render('loginForm', {error})
    }

    static postLogin(req, res){
        const {username, password} = req.body ;
        let userId = 0
        let isFound = false
        User.findOne({
            where: {
                username: username
            }
        })
            .then(user => {
                if(!user){
                    const error = `Invalid username/password!`
                    return res.redirect(`/login?error=${error}`)
                } else {
                    const {id, role} = user ;
                    userId = id
                    const isTrue = bcrypt.compareSync(password, user.password)
                    if(isTrue){
                        isFound= true
                        req.session.userId = id
                        req.session.role = role
                        return Profile.findOne({
                            where: {
                                UserId: id
                            }
                        })
                    } else {
                        const error = `Invalid username/password!`
                        return res.redirect(`/login?error=${error}`)
                    }
                }
            })
            .then((profile) => {
                if(isFound === true){
                    if(!profile){
                        res.redirect(`/addProfile?userId=${userId}`)
                    } else {
                        res.redirect('/shoes')
                    }
                }
            })
            .catch(err => {
                if(err.name === "SequelizeValidationError"){
                  const errors = err.errors.map(el => {
                        return el.message ;
                    })
                    res.redirect(`/login?error=${errors.join(';')}`)
                } else {
                    res.send(err)
                }
            })
    }

    static logOut(req, res){
        req.session.destroy((err) => {
            if(err) {
                console.log(err);
            } else {
                res.redirect('/login')
            }
        })
    }

    static addNewProfile(req, res){
        const {error, userId} = req.query
        console.log(userId);
        res.render('profileForm', {error, userId})
    }

    static saveAddedProfile(req, res){
        const {name, address, city, state, country, postalCode, photo} = req.body ;
        const {userId} = req.params ;
        Profile.create({
            name, address, city, state, country, postalCode, photo, UserId:userId
        })
        .then(() => res.redirect('/shoes'))
        .catch(err => res.send(err))
    }

    static profile(req, res){
        const userId = req.session.userId 
        const {error} = req.query
        Profile.findOne({
            where: {
                UserId : userId
            }
        })
            .then(profile => {
                const{id, name, address, city, state, country, postalCode, photo} = profile;
                res.render('profileDetail', {id, name, address, city, state, country, postalCode, photo, error})
            })
    }

    static editedProfile(req, res){
        const{error} = req.query
        const{profileId} = req.params
        const{name, location, photo} = req.body
        Profile.update({
            name, location, photo
        }, {
            where: {
                id: +profileId
            }
        })
            .then(() => res.redirect('/shoes'))
            .catch(err => res.send(err))
    }

    static cart(req, res){
        const userId = req.session.userId
        User.findOne({
            where:{
                id: +userId
            },
            include: [{
                model: Shoe,
                attributes: ["id", "name", "price", "photo"]
            }, {
                model: Profile,
            }]
        })
            .then(x => {
                const{id, Shoes, Profile} = x ;
                let totalAmount = 0
                const shoesData = Shoes.map(el => {
                    const {id, price, name, Transactions, photo} = el ;
                    const {amount} = Transactions
                    totalAmount += amount
                    return {photo, id, price:priceToRupiah(price), name, totalPrice:priceToRupiah(Transactions.totalPrice(price, amount)), amount}
                })
                const caption = User.generateCaption(Profile.name, totalAmount)
                res.render('cart', {shoesData, Profile, caption, userId})

            })
            .catch(err => {
                console.log(err);
            })
    }
    static deleteFromCart(req, res){
        const {shoeId, userId} = req.params
        let shoeStock = 0
        Transactions.destroy({
            where: {
                UserId: userId,
                ShoeId: shoeId
            }
        })
            .then(() => {
                return Shoe.findOne({
                    where:{
                        id: +shoeId
                    },
                    attributes: ['stock']
                })
            })
            .then(shoe => {
                const{ stock } = shoe ;
                shoeStock = Number(stock) + 1 ;
                return Shoe.update({
                    stock: shoeStock
                }, {
                    where : {
                        id: +shoeId
                    }
                })
            })
            .then(() => res.redirect('/cart'))
            .catch(err => {
                console.log(err);
            })
    }

    static reduceFromCart(req, res){
        const {shoeId, userId} = req.params
        let shoeStock = 0
        Shoe.findOne({
            where:{
                id: +shoeId
            },
            attributes: ['stock']
        })
            .then(shoe => {
                const{ stock } = shoe ;
                shoeStock = Number(stock) + 1 ;
                return Shoe.update({
                    stock: shoeStock
                }, {
                    where : {
                        id: +shoeId
                    }
                })
            })
            .then(() => {
                return Transactions.findOne({
                    where:{
                        UserId: userId,
                        ShoeId: shoeId
                    },
                    attributes: ["amount"]
                })
            })
            .then(trans => {
                const {amount} = trans ;
                let newAmount = Number(amount) - 1 
                return Transactions.update({
                    amount: +newAmount
                }, {
                    where: {
                        UserId: userId,
                        ShoeId: shoeId
                    }
                })
            })
            .then(() => res.redirect('/cart'))
            .catch(err => res.send(err))
    }

    static editShoe(req, res){
        const {shoeId} = req.params ;
        const {error} = req.query ;
        let shoeData = "" ;
        Shoe.findOne({
            where:{
                id: +shoeId
            }
        })
            .then(shoe => {
                const{id, name, usedBy, description, photo, price, stock, BrandId} = shoe ;
                shoeData = {id, name, usedBy, description, photo, price, stock, BrandId} ;
                return Brand.findAll({
                    order: [['id', 'ASC']]
                })
            })
            .then(brands => {
                const brandsData = brands.map(el => {
                    const {id, name} = el ;
                    return {id, name}
                })
                return res.render('editShoeForm', {brandsData, shoeData, error})
            })
            .catch(err => {
                console.log(err);
            })
    }

    static saveEditedShoe(req, res){
        const {name, usedBy, description, photo, price, stock, BrandId} = req.body
        const {shoeId} = req.params ;
        const input = {name, usedBy, description, photo, price, stock, BrandId} ;
        Shoe.update(input, {
            where: {
                id: +shoeId
            }
        })
            .then(() => res.redirect('/shoes'))
            .catch(err => {
                if(err.name === "SequelizeValidationError"){
                    const errors = err.errors.map(el => {
                        return el.message ;
                    })
                    res.redirect(`/shoes/edit/${shoeId}?error=${errors.join(';')}`)
                } else {
                    res.send(err)
                }
            })
    }

    static printInvoice(req, res){
        const{userId} = req.params ;
        let itemsData = "" ;
        User.findOne({
            where:{
                id: +userId
            },
            include: [{
                model: Shoe,
                attributes: ["id", "name", "price", "photo"]
            }, {
                model: Profile,
            }]
        })
            .then(x => {
                const{id, Shoes, Profile} = x ;
                let totalPrice = 0
                const shoesData = Shoes.map(el => {
                    const {id, price, name, Transactions} = el ;
                    const {amount} = Transactions
                    totalPrice += price
                    return {id, price, description:name, quantity:amount}
                })
                const {name, address, city, state, country, postalCode} = Profile ;
                const profileFix = {name, address, city, state, country, postalCode}
                const orderNumber = Number(User.generateOrderNumber(id))
                let dataFix = {shoesData, profileFix, totalPrice, orderNumber}
                printInvoice(dataFix)
                res.redirect(`/${profileFix.name}.pdf`)

            })
            .catch(err => {
                console.log(err);
            })
    }


}

module.exports = Controller