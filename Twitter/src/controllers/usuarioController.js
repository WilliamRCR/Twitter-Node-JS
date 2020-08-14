'use strict'

var bcrypt = require('bcrypt-nodejs')
var Usuario = require('../models/usuario')
var jwt = require('../services/jwt')

function registrar (req, res){
    var usuario = new Usuario()
    var params = req.body.commands.split(' ');

    if(params.length == 3){
        usuario.username = params[1];
        usuario.password = params[2];
        Usuario.find({$or: [
            {username: usuario.username}
        ]}).exec((err, users)=>{
            if(err) return res.status(500).send({message:"Error al registrar"})
            if(users && users.length >= 1){
                return res.status(500).send({message:"Usuario ya registrado"})
            }else{
                bcrypt.hash(params[2], null, null, (err, hash)=>{
                    usuario.password = hash;
                    usuario.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({message:"Error al registrar"})
                        if(usuarioGuardado){
                            res.status(200).send({usuario: usuarioGuardado})
                        }else{
                            res.status(404).send({message:"No se ha podido registrar al usuario"})
                        }
                    })
                })
            }
        })
    }else{
        res.status(500).send({message:"Rellene todos los datos"})
    }
}

function inicioSesion(req, res){
    var params = req.body.commands.split(' ');
    console.log(params[1]);
    

    Usuario.findOne({username: params[1]}, (err, usuarioLogeado)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'})
        console.log(usuarioLogeado.password);
        
        if(usuarioLogeado){
            bcrypt.compare(params[2], usuarioLogeado.password, (err, check)=>{
                if(check){
                        return res.status(200).send({
                            token:jwt.createToken(usuarioLogeado)
                        })
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'})
                }
            })
        }else{
            return res.status(404).send({message: 'No se ha podido iniciar sesión'})
        }
    })
}


function like(req, res){
    var id = req.body.commands.split(' ')[1];

    Usuario.findOne({'listaTweets._id': id}, (err, li)=>{
        if(err) return res.status(500).send({message:"Error en la petición"})
        if(!li) return res.status(404).send({message:"Tweet no encontrado"})
        
        Usuario.findOne({'listaTweets._id': id, 'listaTweets.likes.usuario': req.user.sub}, (err, uli)=>{
            if(err) return res.status(500).send({message:"Error en la petición"})
            if(!uli){
                Usuario.findOneAndUpdate({'listaTweets._id': id}, {$push:{listaTweets: {likes: {usuario: req.user.sub}}}}, {new:true}, (err, laik)=>{
                    if(err) return res.status(500).send({message:"No se pudo dar like"})
                    if(!laik) return res.status(404).send({message:"Error"})
                    laik.listaTweets.forEach((key)=>{
                        var index = laik.listaTweets.indexOf(key)

                        laik.listaTweets[index].likes = key.likes.length
                    })
                    return res.status(200).send({like: laik})
                })
            }else{
                Usuario.findOneAndUpdate({'listaTweets._id': id}, {$pull:{listaTweets: {likes: {usuario: req.user.sub}}}}, {new:true}, (err, laik)=>{
                    if(err) return res.status(500).send({message:"No se pudo dar like"})
                    if(!laik) return res.status(404).send({message:"Error"})
                    laik.listaTweets.forEach((key)=>{
                        var index = laik.listaTweets.indexOf(key)

                        laik.listaTweets[index].likes = key.likes.length
                    })
                    return res.status(200).send({like: laik})
                })
            } 
        })
    })
}


function perfil (req, res){
    var params = req.body.commands.split(' ');

    Usuario.findOne({username: params[1]}, (err, usuario)=>{
        if(err) return res.status(500).send({message:'Usuario no encontrado'})
        return res.status(200).send({user: usuario})
    })
}

function seguir (req, res){
    var params = req.body.commands.split(' ');
    Usuario.findOne({_id: req.user.sub}, (err, ue)=>{
        if(ue.username == params[1]){
            return res.status(500).send({message:"No se puede autoseguir"})
        }
        var cont = 0;
        var acum = false;

        do{
            if(ue.seguidos[cont].username == params[1]){
                acum = true;
            }
            cont++;

        }while(cont < ue.seguidos.length)
        if(acum) return res.status(500).send({message:"Ya sigue a este usuario"})

        Usuario.findOne({username: params[1]}, (err, us)=>{
           if(err) return res.status(500).send("Error en la petición 000")
           if(!us) return res.status(500).send("El usuario no existe")
           
           Usuario.findOneAndUpdate({_id: req.user.sub}, {$push: {seguidos: {username: params[1]}}},
            {new:true}, (err, seguido)=>{
                if(err) return res.status(500).send({message:"Error en la petición"})
                if(!seguido) return res.status(404).send({message:"No se pudo seguir al usuario"})
                return res.status(200).send({username: seguido})
            })
        
        })
    })
    
}

function dejarDeSeguir(req, res){
    var params = req.body.commands.split(' ');
    Usuario.findOne({_id: req.user.sub}, (err, ue)=>{
        if(ue.username == params[1]){
            return res.status(500).send({message:"No se puede autoseguir"})
        }

        var cont = 0;
        var acum = false;

        do{
            if(ue.seguidos[cont].username == params[1]){
                acum = true;
            }
            cont++;

        }while(cont < ue.seguidos.length)

        if(!acum) return res.status(500).send({message:"No sigue a este usuario"})

         Usuario.findOneAndUpdate(params.username, {$pull : {seguidos: {_id: params.username}}}, (err, usuario)=>{
            if(err) return res.status(500).send({message:"Error en la petición"})
            if(!usuario) return res.status(404).send({message:"Error, intente nuevamente"})
            return res.status(200).send({username: usuario})
        })
    })
}

module.exports = {
    registrar,
    inicioSesion,
    perfil,
    seguir,
    dejarDeSeguir,
    like
}