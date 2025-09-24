const Artikel = require('../model/article');
const fs = require('fs');
const path = require('path');



//// Controller untuk artikel
exports.buatArtikel= async (req, res) => {
    try{
                const artikelBaru = new Artikel({
            judul: req.body.judul,
            isi:req.body.isi,
            gambar:req.file ? req.file.filename : null
        });

        const artikel = await artikelBaru.save();
        res.status(201).json(artikel);
    }catch(error){
        res.status(400).json({message:error.message});
    }
}

exports.lihatsemuaArtikel = async (req, res) => {
    try{
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const search = (req.query.search || '').trim();
        const filter = search ? { judul: { $regex: search, $options: 'i' } } : {};

        const total = await Artikel.countDocuments(filter);
        const semuaArtikel = await Artikel.find(filter)
            .sort({ Tanggal: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            data: semuaArtikel,
            pagination: { total, page, totalPages: Math.ceil(total / limit) }
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
}

exports.updateArtikel = async (req, res) =>{
    try{
        const {id} = req.params;
        const updateData= {...req.body};
        if(req.file){
            updateData.gambar = req.file.filename;

            const artikelLama = await Artikel.findById(id);
            if(artikelLama && artikelLama.gambar){
                const pathGambarLama = path.join(__dirname,'../uploads', artikelLama.gambar);
                fs.unlink(pathGambarLama, (err)=>{
                    if(err) console.error("Gagal hapus gambar lama", err);
                });
            }
        }

        const artikelTerupdate = await Artikel.findByIdAndUpdate(
            id,
            updateData,
            { new:true, runValidators:true }
        );
        if(!artikelTerupdate){
            return res.status(404).json({message:'Artikel tidak ditemukan'});
        }
        res.json(artikelTerupdate);
    }catch (error){
        res.status(400).json({message:error.message});
    }
}


exports.hapusArtikel = async (req, res) =>{
    try{
        const artikelTerhapus = await Artikel.findByIdAndDelete (req.params.id);

        if(!artikelTerhapus){
            return res.status(404).json({message:'Gaada njirr'});
        }
        res.json({message:'Artikel berhasil dihapus'});
    }catch (error){
        res.status(500).json({message:error.message});
    }
}

exports.lihatsatuArtikel = async (req, res) =>{
    try{
        const artikel = await Artikel.findById(req.params.id);
        if(!artikel){
            return res.status(404).json({message:'Artikel tidak ditemukan'});
        }
        res.json(artikel);
    }catch (error){
        res.status(500).json({message:error.message});
    }
}

///Batas Controller Artikel