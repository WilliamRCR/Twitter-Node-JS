'use strict'

const usuarioController = require('./usuarioController')
const tweetController = require('./tweetController')
const md_auth = require('../middlewares/authenticated')

function commands(req, res){
    var command = req.body.commands.toLowerCase();
    var params = command.split(' ')[0];
    console.log(params)
    switch(params){
        case 'register':
            usuarioController.registrar(req, res);
        break;

        case 'login':
            usuarioController.inicioSesion(req, res);
        break;

        case 'profile':
            md_auth.ensureAuth(req, res);
            usuarioController.perfil(req, res);
        break;

        case 'add_tweet':
            md_auth.ensureAuth(req, res);
            tweetController.agregarTweet(req, res);
        break;

        case "edit_tweet":
            md_auth.ensureAuth(req, res);
            tweetController.editarTweet(req, res);
        break;

        case "delete_tweet":
            md_auth.ensureAuth(req, res);
            tweetController.eliminarTweet(req, res);
        break;

        case "view_tweets":
            md_auth.ensureAuth(req, res);
            tweetController.verTweets(req, res);
        break;
        
        case 'follow':
            md_auth.ensureAuth(req, res);
            usuarioController.seguir(req, res);
        break;

        case 'unfollow':
            md_auth.ensureAuth(req, res);
            usuarioController.dejarDeSeguir(req, res);
        break;

        case 'like_tweet':
            md_auth.ensureAuth(req, res);
            tweetController.like(req, res);
        break;

        case 'retweet':
            md_auth.ensureAuth(req, res);
            tweetController.reTweet(req, res);
        break;

        case 'reply_tweet':
            md_auth.ensureAuth(req, res);
            tweetController.comentar(req, res);
        break;
        
    }
}

module.exports = {commands}