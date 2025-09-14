const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  nama: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
},
  qty: { 
    type: Number, required: true 
},
  unit: { 
    type: String, 
    required: true, 
    trim: true 
}, // contoh: gram, butir, sdm
  alternatif: [{ 
    type: String, 
    trim: true, 
    lowercase: true 
  }]
}, { _id: false });

const ResepSchema = new mongoose.Schema({
  judul: {
    type: String, 
    required: true, 
    trim: true
  },
  deskripsi: { 
    type: String, 
    trim: true 
  },
  porsi: { 
    type: Number, 
    default: 2 
  },
  durasiMenit: { 
    type: Number, 
    default: 30 
  },
  tingkatKesulitan: { 
    type: String, 
    enum: ['mudah','sedang','sulit'], 
    default: 'mudah' 
  },
  perkiraanBiaya: { 
    type: Number, 
    default: 0 
  }, 
  ingredients: { 
    type: [IngredientSchema], 
    required: true 
  },
  langkahMasak: { 
    type: [String], 
    required: true 
  },
  nutrisi: {
    kalori: Number, protein: Number, karbo: Number, lemak: Number
  },
  tags: [{ 
    type: String, 
    trim: true, 
    lowercase: true 
  }],
  gambar: { 
    type: String, 
    default: null 
  }, 
}, { timestamps: true });

const Resep = mongoose.model('Resep', ResepSchema);
module.exports= Resep;


