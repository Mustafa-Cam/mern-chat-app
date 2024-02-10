// Bu model mesajların tutulduğu model model de veritabanının karşılığı. 
const mongoose = require("mongoose");


const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false }, // amacımız chat grup mu yoksa özel mi onu belirtmek.   
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // object id nin anlamı bu arrayin içindekilerin hepsinin id si var anlamına geliyor. 
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",// bu ObjectId'lerin "Message" koleksiyonundaki belirli bir dokümana referans olduğunu gösterir.
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // oluşma, güncelleme tarihlerini belirtir. 
);

const Chat = mongoose.model("Chat", chatModel); // burda Chat mongodb deki koleksiyon adı chat model de yukarda tanımladığımız model. 

module.exports = Chat;