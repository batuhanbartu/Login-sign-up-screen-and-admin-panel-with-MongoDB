const express = require('express');
const bcrypt = require("bcrypt");
const collection = require("./config");
const saltRounds = 10; 



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.get('/admin', async (req, res) => {
    try {
        const kullanicilar = await collection.find({}); // Tüm kullanıcıları al
        res.render('admin', { kullanicilar: kullanicilar }); // EJS şablonuna verileri gönder
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/admin/update/:id', async (req, res) => {
    const kullanici = await collection.findById(req.params.id);
    res.render('update', { kullanici: kullanici });
});

app.post('/admin/update/:id', async (req, res) => {
    const { name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.findByIdAndUpdate(req.params.id, { name: name, password: hashedPassword });
    res.redirect('/admin');
});

app.post('/admin/delete/:id', async (req, res) => {
    await collection.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});


app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Kullanıcı kaydı
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // Mail formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.name)) {
        return res.send("Geçersiz mail formatı.");
    }

    // Veritabanında kullanıcının zaten olup olmadığını kontrol et
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
        return res.send("Bu mail zaten kullanılmakta!");
    } else {
        // bcrypt kullanarak şifreyi hashle
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword; // 

        await collection.insertMany([data]); // insertMany bir array bekler.
        // Kayıt başarılıysa kullanıcıyı login sayfasına yönlendir
        res.redirect('/');
    }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("Kullanıcı adı bulunamadı");
        }

        // Veritabanındaki hashlenmiş şifreyi düz metinle karşılaştırıyor
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Yanlış şifre");
        }
    } catch {
        res.send("Yanlış Detaylar");
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Sunucu ${port} Numaralı Portta Çalışıyor`);
});
