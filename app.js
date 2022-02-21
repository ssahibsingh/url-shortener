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

console.log(process.env.BASE_URL);

var longURL;
var error = "Server Error!! Please Try Again Later.";

app.get('/', (req, res) => {
    res.render('index', { error: "", shortURL: "" });
})

app.post('/', (req, res) => {
    const shortID = nanoid(10);

    longURL = req.body.longURL;

    if (validURL.isUri(longURL)) {
        const newURL = new URL({
            longURL: longURL,
            shortURL: process.env.BASE_URL + "/" + shortID,
            shortID: shortID
        })
        URL.findOne({ longURL: longURL }, function (err, result) {
            if (!err) {
                if (result == null) {
                    newURL.save(function (erro) {
                        if (erro) {
                            console.log(erro);
                            res.render('index', { error: error, shortURL: "" });
                        }
                        else {
                            displayShortURL(req, res);
                        }
                    })
                }
                else {
                    console.log("Original URL already in Database");
                    res.redirect('/api');
                }
            }
            else {
                console.log("Error Occured in Finding");
                res.render('index', { error: error, shortURL: "" });
            }
        })
    }
    else {
        error = "Invalid URL";
        res.render('index', { error: error, shortURL: "" });
    }
})

function displayShortURL(req, res) {
    URL.findOne({ longURL: longURL }, function (err, result) {
        if (!err) {
            res.render('index', { shortURL: result.shortURL, error: "" });
        }
    })
}

app.get('/:shortID', async (req, res) => {
    const result = await URL.findOne({ shortID: req.params.shortID })
    if (result == null) return res.sendStatus(404)

    res.redirect(result.longURL);
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Successfully listening");
})