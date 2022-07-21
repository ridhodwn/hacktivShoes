const express = require('express') ;
const app = express() ;
const port = 3000 ;
const router = require('./routes/router')

app.set('view engine', 'ejs') ;
app.use(express.urlencoded({extended:true}))
app.use(router) ;

app.listen(port, () => {
    console.log(`App is listening to ${port}`);
})