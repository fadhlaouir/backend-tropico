const mongoose = require('mongoose');
const ProductPrice = require("./productPrice.model")
const ProductCategorie = require("./productCategorie.model")
const ProductSchema = mongoose.Schema({

    titreAr: String,
    titreFr: String,

    prix: [
        {
          type: ProductPrice.schema,
          ref: "ProductPrice",
        },
      ],
    categorie: [
      {
        type: ProductCategorie.schema,
        ref: "ProductCategorie",
      },
    ],
  
    pourcentage: {type: Number,default: 0 },
    langue: {type: String,default: 'Ar' },
    postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
     lastUpdate: Date
}, {
    timestamps: true
}, {versionKey: false});

module.exports = mongoose.model('Product', ProductSchema);