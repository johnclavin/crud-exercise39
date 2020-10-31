const express = require('express');
const bodyParser = require('body-parser');
const JC_MClient = require('mongodb').MongoClient
const app = express();
const db_url = 'mongodb+srv://horse:userpw357@jc-cluster39.tfcn9.mongodb.net/test?retryWrites=true&w=majority';

JC_MClient.connect(db_url, {
    useUnifiedTopology: true
  }, {
    useNewUrlParser: true
  }).then(thenCall)
  .catch(console.error);

function thenCall(saul) {
  console.log('Connected to Database');
  const jc_db = saul.db('horseface-quotes');
  const quotesCollection = jc_db.collection('quotes');

  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static('public'));

  app.get('/', callBack);
  function callBack(request, respond) {
    jc_db.collection('quotes').find().toArray()
      .then(results => {
        respond.render('index.ejs', { quotes: results })
      })
      .catch(console.log('No Fish'));
  }

  app.post('/quotes', (req, res) => {
    quotesCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
  })

  app.put('/quotes', (req, res) => {
    quotesCollection.findOneAndUpdate({
        name: 'Bob' }, 
        {
        $set: {
          name: req.body.name,
          quote: req.body.quote
        }
      }, 
      {
        upsert: true
      }
    )
      .then(result => {
        res.json('Success')
        console.log('Success is good!');
      })
      .catch(error => console.error(error))
  })

  app.delete('/quotes', (req, res) => {
    quotesCollection.deleteOne(
      { name: req.body.name }
    )
      .then(result => {
        if (result.deletedCount === 0) {
          return res.json('No quote to delete')
        }
        res.json('Quote Deleted')
      })
      .catch(error => console.error(error))
  })

  app.listen(3000, function () {
    console.log('listening on 3000');
  });
}

