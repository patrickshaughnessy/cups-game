const express = require('express');
const es6Renderer = require('express-es6-template-engine');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('html', es6Renderer);
app.set('views', 'views');
app.set('view engine', 'html');

app.use(logger());
app.use(cookieParser());
app.use(express.static('dist'));

app.get('/:id', (req, res) => {
  console.log('req session', req.session);
  res.render('game');
});

app.get('/', (req, res) => {
  console.log('rendering');
  res.render('index');
});

app.listen(PORT, () => {
  console.log('running on', PORT);
});
