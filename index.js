const Express = require('express');
const expressNunjucks = require('express-nunjucks');
const ip = require('ip');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const minifyHTML = require('express-minify-html');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
 
const logger = require('../libs/logger');
 
const app = new Express();
const server = new Express();
const mongoUrl = 'mongodb://mongo-store/nodeapp';
 
// Set prod to true for use within views
if (app.settings.env === 'production') {
    app.prod = true;
}
 
MongoClient.connect(mongoUrl, { autoReconnect: true })
.then((db) => {
    logger.info('connected to mongodb');
})
.catch((err) => {
    logger.error(new Error(err));
});
 
app.set('trust proxy', true);
app.set('views', path.join(__dirname, '../views'));
 
app.use(compression()); // Better performance
app.use(helmet()); // Better security
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
    },
}));
app.use('/public', Express.static(path.join(__dirname, '../public')));
 
expressNunjucks(app, {
    watch: !app.prod,
    noCache: !app.prod,
});
 
server.use('/app1', app);
 
server.listen(8080, () => {
    logger.info(`Started server: http://${ip.address()}:8080`);
});
 
module.exports = app;
