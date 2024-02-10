const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/      use at sideDriwer.js.
//@access          Protected
const accessChat = asyncHandler(async (req, res) => { //! bu metodun amacı sidrawer de yani arama yapılan yerde kullanıcılar çıktıktan sonra tıklanan kullanıcının chat bilgilerine erişmek. mesela ahmet'e tıklanıldığı zaman backend den o kullanıcının önceden tıklayan kullanıcı ile bir sohbeti var mı ? varsa getir yoksa chat oluştur. 
  
  const { userId } = req.body; //! burda sidedrawer de post ile gönderirken userId gönderiliyor req.body işte ona karşılık geliyor.

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({  //!  burda oluşmuş bir chat var mı onu kontrol ediyoruz ve referans alanlarını dolduruyoruz.
    isGroupChat: false,
    $and: [ //! chat de 2 tane user olacağı için bu 2 userın olduğu chat var mı ? anlamı için and operatörü yani hem req.user._id ve userId nin eşleşmesi gereklidir. 
      { users: { $elemMatch: { $eq: req.user._id } } }, //! eşleşme yapılıyor req.user._id ile users eşleşiyor mu diye req.user da authMiddleware.js deki protect metodundan geliyor.
      { users: { $elemMatch: { $eq: userId } } }, // body'den gelen userId ile users eşleşiyor mu ? bu ikisininde doğru olması gerekiyor.
    ],
  })
    .populate("users", "-password") // burda users alanı chat model de ref değer populate de ref alanlarındaki ilişkileri dolduruyor.
    .populate("latestMessage"); //! burda latestmessage alanı dolduruluyor. ama latest message alanı içinde sender alanı var o alanı daha da açmak istersek aşşağdaki kodu yazıyoruz.

  isChat = await User.populate(isChat, { // here purpose of ischat, We will fill a value in ischat. 
    path: "latestMessage.sender", // this corresponds to the user. The purpose of the path is which value in ischat will be filled.
    select: "name pic email", // fields of selected user
  }); 
 
  if (isChat.length > 0){
    res.send(isChat[0]);
  } 
  else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId], //! req.user._id isteği atan yani aktif giriş yapmış kullanıcı oluyor. userId ise req.body den geliyor o da sideDrawer.js de belirtiliyor seçilen kullanıcı da userId oluyor. 
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected    use at MyChat.js

const fetchChats = asyncHandler(async (req, res) => { //! Mychat alanı için kullanıyoruz.
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id }}})  //! burda users alanında req.user._id ile eşleşen verileri getir deniyor. 
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender", // bu alan name,pic ve email ile result'a göre doldurulacak. 
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected   at groupChatModal.js
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users); //! json'dan js nesnesine dönüştürme users'ları sunucuya frontend tarfından json formatı için stringfy ile json formatına dönüştürüldü burda da json formatını parse edip js nesnesine dönüştürüyoruz. 

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }else{
    users.push(req.user); //! burda users dizisine group'u oluşturan yani giriş yapan user eklenecek. 
  }


  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user, //! req.user protect metodundan geliyor. authMiddleware'a bak.
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password") 
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    }, 
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
