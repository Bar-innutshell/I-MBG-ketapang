const express = require('express');
require ('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI) 
    .then(() => console.log('Berhasil terhubung ke MongoDB'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

const cors = require('cors');

const multer = require('multer');
const path = require('path');


const app = express();

const port = 3000;




app.use(cors());
app.use(express.json());



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

