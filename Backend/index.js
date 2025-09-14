const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');

const multer = require('multer');
const path = require('path');


const app = express();
app.use(express.json());
const port = 3000;

const mongoURL = 'mongodb://localhost:27017/';


app.use(cors());
app.use(express.json());


mongoose.connect(mongoURL)
    .then(() => console.log('Berhasil sempurna gess'))
    .catch(err => console.error ('Gagal njirrr', err));

app.get('/',(req, res)=> {
    res.send('Inilah my backend');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const artikelRoute = require('./routes/artikelRoute');
const resepRoute = require('./routes/resepRoute');

app.use('/artikel', artikelRoute);
app.use('/resep', resepRoute);



app.listen(port, ()=> {
    console.log(`server lagi jalan nih di http://localhost:${port}`);
});

