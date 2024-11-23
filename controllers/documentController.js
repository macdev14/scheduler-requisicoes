const Document = require('../models/documentModel');

exports.insertDocument = (req, res) => {  //not used yet
    const document = new Document({
        hidden_name: req.body.hidden_name,
        real_name: req.body.real_name,
        insert_date: req.body.insert_date,
        extension: req.body.extension,
        active: req.body.active
    });
    document
        .save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "Some error occurred while creating the Document."
            });
        });

        res.status(200).send("document saved");
};
