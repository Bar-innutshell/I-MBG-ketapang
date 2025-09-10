const mongoose = require('mongoose');

const artikelScheme = new mongoose.Schema({
    judul:{
        type: String,
        required : true
    },
    isi:{
        type: String,
        required : true
    },
    gambar:{
        type:String,
        required: false
    },
    Tanggal:{
        type:Date,
        default: Date.now
    }
});

const Artikel = mongoose.model('Artikel', artikelScheme);
module.exports= Artikel;