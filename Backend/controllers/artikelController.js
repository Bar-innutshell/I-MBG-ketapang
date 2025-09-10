const Artikel = require('../article');



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
        const artikelTerupdate = await Artikel.findByIdAndUpdate(
            req.params.id,
            req.body,
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