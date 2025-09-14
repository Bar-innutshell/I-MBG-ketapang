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
        const semuaArtikel = await Artikel.find();
        res.json(semuaArtikel);
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
            console.log("terdeteksi gambar baru ygy"); ///ini juga apus yak hwhw
            
            const artikelLama = await Artikel.findById(id);

            if(artikelLama && artikelLama.gambar){
                const pathGambarLama = path.join(__dirname,'../uploads', artikelLama.gambar);

                fs.unlink(pathGambarLama, (err)=>{
                    if(err) console.error("Gagal hapus gambar lama", err);
                });
            }
        }

        const artikelTerupdate = await Artikel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new:true}
        );
        if(!artikelTerupdate){
            return res.status(404).json({message:'Gaada njirr'});
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
            return res.status(404).json({message:'Gaada njirr'});
        }
        res.json(artikel);
    }catch (error){
        res.status(500).json({message:error.message});
    }
}

///Batas Controller Artikel