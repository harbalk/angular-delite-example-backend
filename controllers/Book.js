var mongo = require("mongodb");
var Server = mongo.Server,
	Db = mongo.Db,
	ObjectID = mongo.ObjectID,
	MongoClient = mongo.MongoClient;

console.log("MONGO CREDENTIALS", process.mongo_creds);

var db;
MongoClient.connect(process.mongo_creds.url, function(err, _db){
	db = _db;
});

exports.findAll = function(req, res, next) {
	db.collection("books", function(err, collection){
		collection.find().toArray(function(err, items){
			res.send(items);
		});
	});
};


exports.add = function(req, res, next) {
    var book = req.body;
	book.id = "" + Math.random();
	console.log('Adding book: ' + JSON.stringify(book));    
	db.collection('books', function(err, collection) {      
		collection.insert(book, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				console.log('Success: ' + JSON.stringify(result));
				res.status(201).send(book);
			}
		});
  	});
    
}

exports.update = function(req, res, next) {
	var book = req.body;
	console.log('Updating book: ' + book.id);
	console.log(JSON.stringify(book));
	db.collection('books', function(err, collection) {
		collection.update({ id : book.id}, book, { safe:true, upsert: true }, function(err, result) {
			if (err) {
				console.log('Error updating book: ' + err);
				res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated', book);
				if (result.toJSON().upserted) { // case the book was unfound and added
					res.status(201).send(book);
				} else {
					res.status(200).send(book); // case when the book found and updated
				}
			}
		});
	});
};

exports.delete = function(req, res, next) {
    var id = req.params.id;
    console.log('Deleting book: ' + id);
    db.collection('books', function(err, collection) {
        collection.findOne({id : id}, function(err, book) {
			collection.remove({'id': id}, {safe:true}, function(err, result) {
				if (err) {
					res.send({'error':'An error has occurred - ' + err});
				} else {
					console.log('' + result + ' document(s) deleted');
					console.log(result.toJSON());
					res.send(book);
				}
			});
		});
    });
}