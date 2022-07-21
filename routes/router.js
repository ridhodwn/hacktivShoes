const Controller = require('../controllers/controller') ;
const router = require('express').Router();

router.get('/', Controller.home)
router.get('/brands', Controller.brandList)
router.get('/brands/:id', Controller.shoesByBrand)
router.get('/shoes', Controller.shoeList)
router.get('/shoes/add', Controller.addNewShoe)
router.post('/shoes/add', Controller.saveAddedShoe)
router.get('/shoes/:id/buy', Controller.buyShoe)
router.get('/shoes/:id/detail', Controller.shoeDetail)

module.exports = router ;