const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/",protect,allUsers).post(registerUser); tekrardan araştırdım route kullanımı sebebi okunabilirliği arttırmasıymış yani bu şekildede kullanabilirsin. 
router.post("/login", authUser);

router.route("/").get(protect, allUsers); // allUsers'ı kullan yani /api/user 
router.route("/").post(registerUser);

router.post("/",registerUser);
router.get("/",protect,allUsers);

module.exports = router; //if you notice we always exports as router. 
