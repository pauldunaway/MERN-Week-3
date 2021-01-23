const express = require("express");
const favoriteRouter = express.Router();
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((fave) => {
                        if (!favorite.campsites.includes(fave._id)) {
                            favorite.campsites.push(fave._id);
                        }
                    });
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /partners");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete.");
                }
            })
            .catch((err) => next(err));
    })

// defining partner router by id methods
favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(
            `Operation not supported on /favorites/${req.params.campsiteId}`
        );
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite
                            .save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(favorite);
                            })
                            .catch((err) => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end("This campsite is already a favorite!");
                    }
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: [req.params.campsiteId],
                    })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(
            `Operation not supported on /favorites/${req.params.campsiteId}`
        );
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    if (index > -1) {
                        favorite.campsites.splice(index, 1);
                    }
                    favorite
                        .save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                } else {
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete");
                }
            })
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
