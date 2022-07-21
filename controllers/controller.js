const {Shoe, Brand, User, Transactions, Profile} = require('../models') ;
const { Op } = require("sequelize");
const bcrypt = require('bcryptjs');

class Controller {
    static home(req, res){
        res.render('home')
    }

    static brandList(req, res){
        console.log('ini brands');
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
        // console.log(req.session, 'INI DARI SHOELIST');
        const {search, error} = req.query ;
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
        if(search){
            option.where = {...option.where, 
                name:{
                    [Op.iLike]: `%${search}%`
                }
            }
        }
        Shoe.findAll(option)
            .then(shoes => {
                // console.log(shoes);
                const shoesData = shoes.map(el => {
                    const {id, name, photo, price, Brand, stock} = el ;
                    return {id, name, photo, price, Brand, stock}
                })
                // console.log(shoesData);
                return res.render('shoeList', {shoesData, error, role})
            })
            .catch(err => res.send(err))
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
                // console.log(brand);
                const {id, name, Shoes} = brand ;
                const brandData = {id, name} ;
                const shoesData = Shoes.map(el => {
                    const {id, name, photo, price, stock} = el ;
                    return {id, name, photo, price, stock}
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
            .catch(err => res.send(err))
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
            .catch(err => res.send(err))
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
                    const error = `Please register first`
                    return res.redirect(`/register?error=${error}`)
                } else {
                    const {id, role} = user ;
                    isFound= true
                    userId = id
                    const isTrue = bcrypt.compareSync(password, user.password)
                    if(isTrue){
                        req.session.userId = id
                        req.session.role = role
                        // console.log(req.session, 'INI DARI CONTROLLER');
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
            .catch(err => res.send(err))
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
        const {name, location, photo} = req.body ;
        const {userId} = req.params ;
        // console.log(userId);
        Profile.create({
            name, location, photo, UserId:userId
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
                const{id, name, location, photo} = profile;
                res.render('profileDetail', {id, name, location, photo, error})
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
                let totalAmount = 0
                const shoesData = Shoes.map(el => {
                    // console.log(el);
                    const {id, price, name, Transactions, photo} = el ;
                    // console.log(Transactions);
                    // console.log(Transactions.totalPrice);
                    const {amount} = Transactions
                    // Transactions.totalPrice(price) ;
                    totalAmount += amount
                    return {photo, id, price, name, totalPrice:Transactions.totalPrice(price, amount), amount}
                })
                // console.log(Profile);
                const caption = User.generateCaption(Profile.name, totalAmount)
                res.render('cart', {shoesData, Profile, caption, userId})

            })
            .catch(err => {
                console.log(err);
            })
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
            .catch(err => res.send(err))
    }
}

module.exports = Controller