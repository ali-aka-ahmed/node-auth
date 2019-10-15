import app from './app';

// start the server
app.listen(app.get("port"), () => console.log(`\n TRILL 1 on port ${app.get("port")}, ALL SYSTEMS GO 🚀 \n\n Press CTRL-C to stop \n`)); // eslint-disable-line no-console
