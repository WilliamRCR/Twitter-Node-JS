'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    tweet: String,
    likes: [{
         usuario: {type: Schema.ObjectId, ref: 'usuario'}
     }],
     retweets: [{
        usuario: {type: Schema.ObjectId, ref: 'usuario'}
     }],
    comentarios: Number,
    referencia: {type: Schema.ObjectId, ref:'tweet'},
    usuario: {type: Schema.ObjectId, ref:'usuario'}
})

module.exports = mongoose.model('tweet', TweetSchema)