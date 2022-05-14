const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const mongoAuth = require('../config')

const mongo_username = mongoAuth.configMongo.user
const mongo_password = mongoAuth.configMongo.pwd
const mongo_host = mongoAuth.configMongo.host
const DATABASE_NAME = mongoAuth.configMongo.dbname

const CONNECTION_URI = `mongodb+srv://${mongo_username}:${mongo_password}@${mongo_host}/${DATABASE_NAME}?retryWrites=true&w=majority`

const client = new MongoClient(CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

exports.find = async function (collection, query) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .find(query)
    .toArray();
}

exports.findOne = async function (collection, query) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .findOne(query)
}

exports.insertOne = async function (collection, data) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .insertOne(data)
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

exports.deleteOne = async function (collection, id) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .deleteOne({ "_id": ObjectId(id) })
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

exports.replaceOne = async function (collection, id, data) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .replaceOne({ "_id": ObjectId(id) }, data)
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

exports.updateOne = async function (collection, id, data) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .updateOne({ "_id": ObjectId(id) }, { $set: data })
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

exports.addToSet = async function (collection, id, data) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .updateOne({ "_id": ObjectId(id) }, { $addToSet: data })
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

exports.pullFromSet = async function (collection, id, data) {
  const dbClient = await client.connect();

  return await dbClient
    .db(DATABASE_NAME)
    .collection(collection)
    .updateOne({ "_id": ObjectId(id) }, { $pull: data })
    .then(result => ({ success: true, result: result }))
    .catch(err => ({ success: false, message: err }))
}

const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hash = async (password) => {
  return await bcrypt.hash(password, saltRounds).then((hash) => hash);
}

exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
} 