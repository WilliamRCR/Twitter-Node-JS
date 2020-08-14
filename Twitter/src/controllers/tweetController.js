'use strict'

var bcrypt = require('bcrypt-nodejs')
var Tweet = require('../models/tweet')
var Usuario = require('../models/usuario')
var jwt = require('../services/jwt')

function agregarTweet(req, res){
    var params = req.body.commands.substring(10);
    var tweet = new Tweet;
    
    tweet.tweet = params;
    tweet.usuario = req.user.sub;

    tweet.save((err, tweetG)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(tweetG){
            res.status(200).send({tweet: tweetG})
        }
    })
}

function editarTweet(req, res){
    var id = req.body.commands.split(' ')[1];
    var params = req.body.commands.substring(36)

    Tweet.findOneAndUpdate({_id: id}, {tweet: params}, {new:true}, (err, tweetAct)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(!tweetAct) return res.status(404).send({message: "Error al editar el tweet"})
        return res.status(200).send({tweet: tweetAct})
    })
}

function verTweets(req, res){
    var us = req.body.commands.split(' ')[1];

    Usuario.findOne({username: us}, (err, use)=>{
        if(err) return res.status(500).send({message:'Usuario no encontrado'})
        if(!use) return res.status(404).send({message: "El usuario no existe"})

        Tweet.find({
            usuario: use._id}, (err, ustweet)=>{
            if(err) return res.status(500).send({message:"Error en la petición"})
            if(!ustweet) return res.status(404).send({message:"No se encontró ningún tweet"})
            return res.status(200).send({Tweets: ustweet})
        })
    })

}

function eliminarTweet(req, res){
    var id = req.body.commands.split(' ')[1];

    Tweet.findOneAndDelete({_id: id}, (err, tweetE)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(!tweetE) return res.status(404).send({message:"No se encontró el tweet"})
        return res.status(200).send({Tweet: tweetE})
    })
}

function like(req, res){
    var id = req.body.commands.split(' ')[1];

    Tweet.findOne({_id: id}, (err, li)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(!li) return res.status(404).send({message:"Tweet no encontrado"})

        Tweet.findOne({_id: id, 'likes.usuario': req.user.sub}, (err, uli)=>{
            if(err) return res.status(500).send({message:"Error en la petición"})
            if(!uli){
                Tweet.findOneAndUpdate({_id: id}, {$push: {likes: {usuario: req.user.sub}}}, {new:true}, (err, laik)=>{
                    if(err) return res.status(500).send({message:"No se pudo dar like"})
                    if(!laik) return res.status(404).send({message:"Error"})
                    laik.likes = laik.likes.length
                    laik.retweets = laik.retweets.length
                    return res.status(200).send({likes: laik})
                })
            }else{
                Tweet.findOneAndUpdate({_id: id}, {$pull: {likes: {usuario: req.user.sub}}}, {new:true}, (err, laik)=>{
                    if(err) return res.status(500).send({message:"No se pudo dar dislike"})
                    if(!laik) return res.status(404).send({message:"Error"})
                    laik.likes = laik.likes.length
                    laik.retweets = laik.retweets.length
                    return res.status(200).send({likes: laik})
                })
            }
        })
    })
}

function reTweet(req, res){
    var id = req.body.commands.split(' ')[1];

    Tweet.findOne({_id: id}, (err, ret)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(!ret) return res.status(404).send({message:"No se encontró el tweet"})

        Tweet.findOne({_id: id, 'retweets.usuario': req.user.sub}, (err, retwe)=>{
            if(err) return res.status(500).send({message:"Error al retweetear"})
            if(!retwe){
                Tweet.findOneAndUpdate({_id: id}, {$push: {retweets: {usuario: req.user.sub}}}, {new:true}, (err, r)=>{
                    if(err) return res.status(500).send({message:"Error al hacer el retweet"})
                    var tweet = new Tweet;

                    tweet.tweet = r.tweet;
                    tweet.referencia = r._id;
                    tweet.usuario = req.user.sub;
                    tweet.save((err, rr)=>{
                        if(err) return res.status(500).send({message:"Error"})
                        if(!rr) return res.status(404).send({message:"No se pudo hacer el retweet"})
                        return res.status(200).send({reTweet: rr})
                    })

                })
            }else{
                Tweet.findOneAndUpdate({_id: id}, {$pull: {retweets: {usuario: req.user.sub}}}, {new:true}, (err, r)=>{
                    if(err) return res.status(500).send({message:"No se ha podido cancelar el retweet"})
                    if(!r) return res.status(404).send({message:"No se ha encontrado el hilo"})

                    Tweet.findOneAndDelete({referencia: id, usuario: req.user.sub}, (err, rr)=>{
                        if(err) return res.status(500).send({message: "Error al cancelar"})
                        if(!rr) return res.status(404).send({message: "No se pudo encontrar el hilo"})
                        return res.status(200).send({reTweet: rr})
                    })
                }
            )}
        })
    })
}

function comentar(req, res){
    var id = req.body.commands.split(' ')[1];
    var params = req.body.commands.substring(36)

    Tweet.findOne({_id: id}, (err, com)=>{
        if(err) return res.status(500).send({message:"No se ha podido encontrar el tweet"})
        if(!com) return res.status(404).send({message:"Tweet no existente"})

        Tweet.findOneAndUpdate({_id: id}, {$inc: {comentarios: 1}}, (err, come)=>{
            if(err) return res.status(500).send({message:"No se ha podido agregar el comentario"})
            if(!come) return res.status(404).send({message:"La publicación no existe"})
            var tweet = new Tweet;

                tweet.tweet = params;
                tweet.referencia = come._id;
                tweet.usuario = req.user.sub;
                tweet.save((err, c)=>{
                    if(err) return res.status(500).send({message:"Error"})
                    if(!c) return res.status(404).send({message:"No se pudo hacer el retweet"})
                    return res.status(200).send({comentario: c})
            })
        })
    })
}

module.exports = {
    agregarTweet,
    editarTweet,
    verTweets,
    eliminarTweet,
    like,
    reTweet,
    comentar
}