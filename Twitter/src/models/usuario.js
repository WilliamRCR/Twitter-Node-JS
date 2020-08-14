'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var usuarioEsquema = Schema({
    username: String,
    password: String,
    seguidos: [{
        username: String
    }]
})

module.exports = mongoose.model('usuario', usuarioEsquema)