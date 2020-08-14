'use strict'

var express = require("express")
var rutaUnicaController = require("../controllers/rutaUnicaController")

var api = express.Router()
api.post('/commands', rutaUnicaController.commands)

module.exports = api;