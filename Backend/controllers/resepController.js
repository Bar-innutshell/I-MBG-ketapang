const  Resep = require('../model/resep');


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
            gambar: req.file ? req.file.filename : null
        });
        await resepBaru.save();
        res.status(201).json(resepBaru);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
}