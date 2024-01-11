const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
//! burda aranan kelimeye göre User modelinden eşleşen verileri getirilmesi isteniyor.
const allUsers = asyncHandler(async (req, res) => { // sideDrawer.js
  const keyword = req.query.search
    ? {
        $or: [ // burda mongodb de sorgu oluşturuyoruz $or ikisinide yani hem name alanında arama sonucu hem email alanındaki sonuçları getirecek
          { name: { $regex: req.query.search, $options: "i" } }, // $regex aramayı yapan mongodb sorgumuz. 
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  console.log(keyword);
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id }}); //! $ne ifadesi burda user ın kendisini hariç tutmasını sağlıyor.
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
//! register işlemi
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    // bunlar bir formdan gelecek bilgi olduğu için req yani isteğin inputları olacak req.body bu verileri kastediyor. eğer biri bile eksikse hata döndür.
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email }); // kullanıcı var mı yok mu bakıyor.

  if (userExists) {
    // user yoksa hata döndür
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    //! her şey düzgün ise user oluştur
    name,
    email,
    password,
    pic,
  });

  if (user) {
    // user kaydoldu ise status 201 döndür ve the data yaz. Burda amaç userRoutes.js de "router.route("/").post(registerUser);" burda post isteği gelince frontend tarafından, registerUser yani bu sayfadaki kodlar çalışacak burda da response olarak bu json verisini döndürüyoruz.
    console.log();
    res.status(201).json({
      _id: user._id, // mongodb kendi oluşturuyor.
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // default olarak false oluyor.
      pic: user.pic, // default olarak var.
      token: generateToken(user._id),  // burda token oluşturup client'e gönderdik. client de api isteklerinde bu tokeni sunucuya gönderecek ve sunucu bunu kontrol edip ona göre yetkilendirme vs yapacak.   
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public

// bilgi olarak bir fonksiyonda return zorunlu değil return olursa fonksiyon bir değer döndürüyor ve onu bir yere atayabilirsin ama yoksa da fonksiyon yine istediğini yapabilir illaki return kullanmak zorunda değilsin mesela burda res döndürüyoruz başka yerde console'a yazı yazardık.

//!login işlemleri
const authUser = asyncHandler(async (req, res) => {
  // burda js de fonksiyon değişkene atanabilir buna anonim fonksiyon denir. ya da fonksiyon ifadesi denir.
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // burda && kullanımı mantık devrelerindeki and oluyor yani ikiside doğru olmak zorunda burda da user var ise demek istemiş aslında bu kullanım jsx mi ?
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    }); 
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser };
