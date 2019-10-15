import mongoose from 'mongoose';
import logger from '../util/logger'

export let connectMongo;

connectMongo = (uri) => {
  mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: true,
  })
  .then(() => logger.info('DB Connected!'))
  .catch(err => {
      logger.error("Error", err.message);
  });
  // plug in the promise library:
  mongoose.Promise = global.Promise;
  mongoose.set('useCreateIndex', true);

  // shutdown if error
  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  // load models
  require('./User');
};
