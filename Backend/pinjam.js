const mongoose = require('mongoose');

const pinjamScheme = new mongoose.Schema({
    namapeminjam:{
        type : String,
        requiredd:true
    },
    ruangan:{
        type : String,
        required: true
    },
    perihal:{
        type:String,
        required:true
    },
    tanggalPeminjaman:{
        type: Date,
        required: true,
        default: Date.now
    },
    jamMulai:{
        type:String,
        required:true 
    },
    jamSelesai:{
        type:String,
        required:true 
    }
});

const Peminjaman = mongoose.model('Peminjaman',pinjamScheme);
module.exports=Peminjaman;