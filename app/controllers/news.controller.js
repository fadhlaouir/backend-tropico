const News = require('../models/news.model.js');
const mongoose = require('mongoose');

var serviceAccount = require("../../tropicobackendv2-firebase-adminsdk-ydgb4-0e2505e37a.json");
var admin = require("firebase-admin");

/**
 * Create and Save a new News
 * @param {Request} req 
 * @param {Response} res 
 */
exports.create = async (req, res) => {
    const word = new News({
        titre: req.body.titre,
        image: req.file.filename,
        url: req.body.url, externe: req.body.externe,
        description: req.body.description, categorie: req.body.categorie,
    });

    // Save News in the database
    word.save()
        .then(data => {
            res.send(data);
            var message = {
                notification: {
                    title: data.titre,
                    body: 'قم بزيارة التطبيق للمزيد من المعلومات'
                },
                data: {
                    type: 'news',
                    title: data.titre,
                    body: 'قم بزيارة التطبيق للمزيد من المعلومات'
                },
                topic: 'news',
            };
            // Send a message to devices subscribed to the provided topic.
            admin.messaging().send(message)
                .then((response) => {
                })
                .catch((error) => {
                });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the News."
            });
        });
};

/**
 * Retrieve and return all news from the database.
 * @param {Request} req 
 * @param {Response} res 
 */
exports.findAll = async (req, res) => {
    News.aggregate([
        {
            $project: {
                __v: 0
            }
        }
    ]).match({ masquer: false }).sort({ "updatedAt": -1 })
        .then(news => {
            lastDate = Math.floor(new Date(news[0].updatedAt).getTime() / 1000);
            news.forEach(element => {
                element.createdAt = Math.floor(new Date(element.createdAt).getTime() / 1000);
                element.updatedAt = Math.floor(new Date(element.updatedAt).getTime() / 1000);
            });

            res.send({ status: 200, lastDate, message: "All the news", news });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving news."
            });
        });
};

/**
 * Retrieve and return all news from the database.
 * @param {Request} req 
 * @param {Response} res 
 */
exports.findAllWeb = async (req, res) => {
   News.aggregate([
        {
            $project: {
                __v: 0,
            }
        }
    ]).sort({ "updatedAt": -1 })
        .then(news => {
		if(news){
           // lastDate = Math.floor(new Date(news[0].lastUpdate).getTime() / 1000);
            news.forEach(element => {
                element.createdAt = Math.floor(new Date(element.createdAt).getTime() / 1000);
                element.updatedAt = Math.floor(new Date(element.updatedAt).getTime() / 1000);
            });
}
            res.send({ status: 200,  message: "All the news", news });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving news."
            });
        });
};

/**
 * Find a single news with a newsId
 * @param {Request} req 
 * @param {Response} res 
 */
exports.findOne = async (req, res) => {

    News.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.newsId) } },
        { $project: { lastUpdate: 0, __v: 0 } }
    ])
        .then(news => {
            if (!news) {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            news[0].createdAt = Math.floor(new Date(news[0].createdAt).getTime() / 1000);
            news[0].updatedAt = Math.floor(new Date(news[0].updatedAt).getTime() / 1000);
            res.send({
                status: 200,
                message: "News is found with id " + req.params.newsId, news
            });
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            return res.status(500).send({
                message: "Error retrieving News with id " + req.params.newsId
            });
        });
};


exports.update = async (req, res) => {
    const word = await News.findById(req.params.adId);

    if (req.body.categorie !== undefined) {
        word.categorie = req.body.categorie;
    }
    if (req.body.description !== undefined) {
        word.description = req.body.description;
    }
    if (req.body.externe !== undefined) {
        word.externe = req.body.externe;
    }
    if (req.body.titre !== undefined) {
        word.titre = req.body.titre;
    }
    if (req.body.url !== undefined) {
        word.url = req.body.url;
    }

    if (req.body.masquer !== undefined) {
        word.masquer = req.body.masquer;
    }

    if (req.file !== undefined) {
        word.image = req.file.filename;
    }
    // Find ad and update it with the request body
    word.save()
        .then(word => {
            if (!word) {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            res.send(word);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            return res.status(500).send({
                message: "Error updating News with id " + req.params.newsId
            });
        });
};

/**
 * Delete a News with the specified newsId in the request
 * @param {Request} req 
 * @param {Response} res 
 */
exports.delete = async (req, res) => {
    News.findByIdAndRemove(req.params.newsId)
        .then(word => {
            if (!word) {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            res.send({ message: "News deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "News not found with id " + req.params.newsId
                });
            }
            return res.status(500).send({
                message: "Could not delete news with id " + req.params.newsId
            });
        });
};


/**
 * Change news visiblity    
 * @param {Request} req 
 * @param {Response} res 
 */

exports.masquer = async (req, res) => {
    const news = await News.findById(req.params.newsId);
    if (req.params.masquer !== undefined) {
        news.masquer = req.params.masquer;
    }

    // Find ad and update it with the request body
    news.save()
        .then(news => {
            if (!news) {
                return res.status(404).send({
                    message: "news not found with id " + req.params.newsId
                });
            }
            res.send(news);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "news not found with id " + req.params.newsId
                });
            }
            return res.status(500).send({
                message: "Error updating news with id " + req.params.newsId
            });
        });
};
