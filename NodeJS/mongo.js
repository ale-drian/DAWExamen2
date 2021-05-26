import mongoDriver from 'mongodb'
import config from './config'

const { MongoClient, ObjectId } = mongoDriver

const MONGO_URI = config.mongo.uri
const MONGO_DB = config.mongo.db

class MongoLib {
  constructor () {
    this.client = new MongoClient(MONGO_URI, {
      useUnifiedTopology: true
    })
    this.dbName = MONGO_DB
  }

  /**
   * @return {Promise<import('mongodb').Db>} database
   */
  async connect () {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        console.log('executing promise')
        this.client.connect(err => {
          if (err) {
            reject(err)
          }
          console.log('Connected succesfully to mongo')
          resolve(this.client.db(this.dbName))
        })
      })
    }

    return MongoLib.connection
  }

  async getAll (collection, query) {
    const db = await this.connect()
    return db.collection(collection).find(query).toArray()
  }

  async get (collection, id, query = null) {
    const db = await this.connect()
    query = query || { _id: ObjectId(id) }
    return db.collection(collection).findOne(query)
  }

  async create (collection, data) {
    const db = await this.connect()
    const result = await db.collection(collection).insertOne(data)
    return result.insertedId
  }

  async update (collection, id, data) {
    const db = await this.connect()
    const result = db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true })
    return result.upsertedId || id
  }

  async delete (collection, id) {
    const db = await this.connect()
    await db.collection(collection).deleteOne({ _id: ObjectId(id) })
    return id
  }
}

export default MongoLib
