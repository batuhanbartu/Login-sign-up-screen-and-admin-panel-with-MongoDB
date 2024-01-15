const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/KullanıcıDB");

// Veritabanının bağlanıp bağlanmadığını kontrol et
connect.then(() => {
  console.log("Veritabanı Başarıyla Bağlandı");
})
.catch(() => {
  console.log("Veritabanına Bağlanılamadı");
});

// Bir şema oluştur
const LoginSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true // Gerekli
    },
    password: {
      type: String,
      required: true // Gerekli
    }
  });
  
  // Koleksiyon kısmı
  const collection = new mongoose.model("kullanici", LoginSchema);
  
  module.exports = collection; // Modülü dışa aktar
