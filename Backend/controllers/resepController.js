const  Resep = require('../model/resep');
const fs = require('fs');
const path = require('path');


exports.lihatsemuaResep = async (req, res) => {
    try{
        const semuaResep = await Resep.find();
        res.json(semuaResep);
    }catch(error){
        res.status(500).json({message:error.message});
    }
}

exports.buatResep = async (req, res) => {
    try{
        const resepBaru = new Resep({
            judul: req.body.judul,
            deskripsi: req.body.deskripsi,
            porsi: req.body.porsi,
            durasiMenit: req.body.durasiMenit,
            tingkatKesulitan: req.body.tingkatKesulitan,
            perkiraanBiaya: req.body.perkiraanBiaya,
            ingredients: req.body.ingredients,
            langkahMasak: req.body.langkahMasak,
            nutrisi: req.body.nutrisi,
            tags: req.body.tags,
            gambar: req.file ? req.file.filename : null
        });
        await resepBaru.save();
        res.status(201).json(resepBaru);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
}

exports.updateResep = async (req, res) => {
    try{
        const {id} = req.params;
        const updateData= {...req.body};

        if(req.file){
            updateData.gambar = req.file.filename;
            console.log("terdeteksi gambar baru ygy"); //kalo ini masih ada di kalian apus aja plis

            const resepLama = await Resep.findById(id);

            if(resepLama && resepLama.gambar){
                const pathGambarLama = path.join(__dirname, '../uploads', resepLama.gambar);

                fs.unlink(pathGambarLama, (err) => {
                    if (err) console.log("nooo gagal njir :", err);
                });
            }
        }

        const resepTerupdate = await Resep.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new:true}
        );
        if(!resepTerupdate){
            return res.status(404).json({message:'Gaada njirr'});
        }
        res.json(resepTerupdate);
    }catch(error){
        res.status(400).json({message: error.message});
    }
}
        





exports.hapusResep = async (req, res) => {
    try{
        const respTerhapus = await Resep.findByIdAndDelete(req.params.id);
        if(!respTerhapus){
            return res.status(404).json({message:'Gaada njirr'});
        }
        res.json({message:'Resep berhasil dihapus'});
    }catch(error){
        res.status(400).json({message: error.message});
    }
}

exports.lihatResepdariID = async (req, res) => {
    try{
        const resep = await Resep.findById(req.params.id);
        if(!resep){
            return res.status(404).json({message:'Gaada njirr'});
        }
        res.json(resep);
    }catch(error){
        res.status(400).json({message: error.message});
    }
}