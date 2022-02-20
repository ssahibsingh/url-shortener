require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid')
const validURL = require('valid-url');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



mongoose.connect(process.env.MONGOOSE_URI);

const urlSchema = new mongoose.Schema({
    longURL: String,
    shortURL: String,
    shortID: String
})

const URL = new mongoose.model('URL', urlSchema);

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/', (req, res) => {
    const shortID = nanoid(10);
    const longURL = req.body.longURL;
    if (validURL.isUri(longURL)) {
        const newURL = new URL({
            longURL: longURL,
            shortURL: process.env.BASE_URI + "/" + shortID,
            shortID: shortID
        })
        URL.findOne({ longURL: longURL }, function (err, result) {
            if (!err) {
                if (result != null) {
                    newURL.save(function (error) {
                        if (error) {
                            console.log(error);
                        }
                        else{
                            res.redirect('/');
                        }
                    })
                }
                else{
                    console.log("Original URL already in Database");
                }
            }
            else{
                console.log("Error Occured in Finding");
            }
        })

    }
    else {
        res.status(404).json("Invalid Original Url");
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Successfully listening");
})