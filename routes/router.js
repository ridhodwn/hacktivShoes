const Controller = require('../controllers/controller') ;
const UserController = require('../controllers/user-controller');
const router = require('express').Router();

//Get /register
router.get('/register', UserController.registerForm);
//Post /register
router.post('/register', UserController.postRegister);

//Get /login
router.get('/login', UserController.loginForm);
//Post /login
router.post('/login', UserController.postLogin);

const isLoggedIn = function(req, res, next) {
    if(!req.session.userId) {
        const error = 'Please login first';
        res.redirect(`/login?error=${error}`);
    } else {
        next();
    }
};

router.use(isLoggedIn);

router.get('/logout', UserController.getLogOut);

router.get('/', Controller.home)
router.get('/brands', Controller.brandList)
router.get('/brands/:id', Controller.shoesByBrand)
router.get('/shoes', Controller.shoeList)
router.get('/shoes/add', Controller.addNewShoe)
router.post('/shoes/add', Controller.saveAddedShoe)
router.get('/shoes/:id/buy', Controller.buyShoe)
router.get('/shoes/:id/detail', Controller.shoeDetail)

module.exports = router ;