const express = require('express') ;
const app = express() ;
const port = 3000 ;
const router = require('./routes/router')
const session = require('express-session')

app.set('view engine', 'ejs') ;
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(session({
    secret: 'secretaaaa',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
    }
  }))
app.use(router) ;
// app.get('/shoes', Controller.home)

app.listen(port, () => {
    console.log(`App is listening to ${port}`);
})