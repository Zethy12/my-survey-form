const express =require('express')
const mangoose =require('mangoose')
const bcrypto =require('bcrypt')
const path = require('path')
const { execPath } = require('process')
const { connect } = require('http2')
const { default: mongoose } = require('mongoose')

/*const app=express();

app.get('/',(req/res)=>){
    res.reader("Fill out Survey")
}

app.get()*/
app.use(express.urlencoded({ extended: true }));


mongoose.connect("mongodb://localhost:27017/surveyDB",{ useNewUrlParser: true, useUnifiedTopology: true });
const surveySchema= new mongoose.Schema({
    fname:String,
    email: String,
    dob:Date,
    contactNum:String,
    favFood:[String],
    likesMovies: String,
     likesRadio: String,
     likesEatOut: String,
   likesTV: String
});

app.post("/submit-survey", (req, res)=>{
    const newSurvey = new Survey({
        name: req.body.fname,
        email: req.body.email,
        dob: new Date(req.body.dob),
        contactNum: req.body.cnum,
        favFood:req.body.favFood,
        likesMovies: req.body.row1,
        likesRadio: req.body.row2,
        likesEatOut: req.body.row3,
        likesTV: req.body.row4
    });

    newSurvey.save()
    .then(()=>res.redirect("/view-results"))
    .catch((err)=> res.status(500).send(err));
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));



