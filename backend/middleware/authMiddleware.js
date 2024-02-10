const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => { //! next fonksiyonu, Express middleware'lerinin kontrol akışını yönetmek için kullanılır. Eğer bir middleware, işlevini başarıyla tamamladıysa ve bir sonraki adıma geçilmesine izin vermek istiyorsa, next fonksiyonunu çağırır. Burda da try bloğunda kullanmışız dikkat ettiysen zaten. Yani işlemler istenildiği gibi ise diğerine geç diyor.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //! eğer bu ikisi doğru ise bloğa geç. react'da config ile header'ı ayarladık oraya bakabilirsin. 
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; //! Bearer jwt oluyor bizde jwt'nı almak için bu şekilde bölüp aldık.

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //! decodes değişkeni jwt içindeki bilgileri içerir.

      req.user = await User.findById(decoded.id).select("-password");

      next(); 
    } catch (error) { 
      res.status(401); 
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
