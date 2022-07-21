const {Shoe, Brand, User, Transaction} = require('../models') ;
const { Op } = require("sequelize");

class Controller {
    static home(req, res){
        res.render('home')
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
                res.render('brandList', {brandsData})
            })
            .catch(err => res.send(err))
    }

    static shoeList(req, res){
        const {search} = req.query ;
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
                res.render('shoeList', {shoesData})
            })
            .catch(err => res.send(err))
    }

    static buyShoe(req, res){
        const {id} = req.params ;
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
            .then(() => res.redirect('/shoes'))
            .catch(err => res.send(err))
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
                res.render('shoeByBrand', {brandData, shoesData});
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
                res.render('shoeDetail', {shoeData, Brand})
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
                res.render('addNewShoeForm', {brandsData, error})
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
}

module.exports = Controller