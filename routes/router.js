const Controller = require('../controllers/controller') ;
const UserController = require('../controllers/user-controller');
const router = require('express').Router();
// const session = require('express-session')


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
//Register
router.get('/register', Controller.register)
router.post('/register', Controller.postRegister)

//Login
router.get('/login', Controller.login)
router.post('/login', Controller.postLogin)

router.use(function (req, res, next) {
    if(!req.session.userId){
        const error = `Please login first!`
        res.redirect(`/login?error=${error}`)
    } else {
        next() ;
    }
})

router.use(function (req, res, next) {
    // console.log(req.session);
    console.log(req.session);
    next() ;
})

const isAdmin = function (req, res, next) {
    if(req.session.role !== 'admin'){
        const error = `You don't have permission to add new shoe!`
        res.redirect(`/shoes?error=${error}`)
    } else {
        next()
    }
}
const isGuest = function (req, res, next) {
    if(req.session.role !== 'guest'){
        const error = `You don't have permission to buy shoe!`
        res.redirect(`/shoes?error=${error}`)
    } else {
        next()
    }
}


router.get('/brands', Controller.brandList)
router.get('/brands/:id', Controller.shoesByBrand)
router.get('/cart', isGuest, Controller.cart)
router.get('/cart/:userId/delete/:shoeId', isGuest, Controller.deleteFromCart)
router.get('/cart/:userId/reduce/:shoeId', isGuest, Controller.reduceFromCart)
router.get('/invoice/:userId', isGuest, Controller.printInvoice)
router.get('/shoes', Controller.shoeList)
router.get('/shoes/add', isAdmin, Controller.addNewShoe)
router.post('/shoes/add', Controller.saveAddedShoe)
router.get('/shoes/edit/:shoeId', isAdmin, Controller.editShoe)
router.post('/shoes/edit/:shoeId', Controller.saveEditedShoe)
router.get('/addProfile', Controller.addNewProfile)
router.post('/addProfile/:userId', Controller.saveAddedProfile)
router.get('/profile/detail', Controller.profile)
router.post('/profile/detail/:profileId', Controller.editedProfile)
router.get('/shoes/:id/buy', isGuest, Controller.buyShoe)
router.get('/shoes/:id/detail', Controller.shoeDetail)
router.get('/logout', Controller.logOut)

module.exports = router