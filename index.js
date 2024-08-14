const fs = require('fs'); //fs for file system
const http = require('http'); //built-in http for networking capability
const path = require('path');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

//Constant
const UTF8 = 'utf-8';
const OVERVIEW = ['/', '/overview'];
const PRODUCT = '/product';
const API = '/api';

const TEXT_HTML = 'text/html';
const HTML_OBJ = { Content_Type: TEXT_HTML };
const APPLICATION_JSON = 'application/json';
const LOCAL_HOST = '127.0.0.1';

/*
//////////////////////////////////////////
//FILES

//blocking - synchronous way
//to read file
const textInput = fs.readFileSync('./txt/input.txt', UTF8);
console.log(textInput);
console.log(typeof textInput);

//to write file
const textOutput = `This is what we know about avocado: ${textInput}\nCreated on ${new Date()}`;
fs.writeFileSync('./txt/output.txt', textOutput);
console.log('file written');

//non-blocking, async
fs.readFile('./txt/start.txt', UTF8, (_, data1) => {
  fs.readFile(`./txt/${data1}.txt`, UTF8, (_, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, UTF8, (_, data3) => {
      console.log(data3);
      fs.writeFile('./txt/async.txt', `${data2}\n${data3}`, UTF8, () => {
        console.log('writing file done');
      });
    });
  });
});
console.log('Reading start.txt ...');
*/

//////////////////////////////////////////
//SERVER
//executed only ONCE at the begining
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, UTF8);
const dataObj = JSON.parse(data);

const createSlugify = function (dataObj) {
  dataObj.forEach(entry => {
    entry.slug = slugify(entry.productName, { lower: true });
  });
};

createSlugify(dataObj);

//load the templates
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  UTF8
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  UTF8
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  UTF8
);

//execute everytime a request hit
const server = http.createServer((req, res) => {
  //destructuring
  const { pathname: pathName, query } = url.parse(req.url, true);

  //Overview page
  if (OVERVIEW.includes(pathName)) {
    res.writeHead(200, HTML_OBJ);

    const cardsHtml = dataObj
      .map(prod => replaceTemplate(templateCard, prod))
      .join('');

    const htmlRes = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(htmlRes);

    //Product page
  } else if (pathName === PRODUCT) {
    const product =
      dataObj[dataObj.findIndex(entry => entry.slug === query.name)];

    if (!product) {
      res.writeHead(404, {
        Content_Type: TEXT_HTML,
        custom: 'pls try a different url',
      });
      res.end('<h1>Page not found!</h1>');
    }
    res.writeHead(200, HTML_OBJ);
    const productHtml = replaceTemplate(templateProduct, product);
    res.end(productHtml);

    //API page
  } else if (pathName === API) {
    res.writeHead(200, {
      Content_Type: APPLICATION_JSON,
    });
    res.end(data);

    //NOT Found
  } else {
    res.writeHead(404, {
      Content_Type: TEXT_HTML,
      custom: 'pls try a different url',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8080, LOCAL_HOST, () => {
  console.log('Server is up and running');
});
