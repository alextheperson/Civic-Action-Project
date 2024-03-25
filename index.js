const express = require('express');
const fs = require('fs');
const scraper = require('./scraper.js');
const codes = require('./school-districts.js');
const util = require('./util.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.static('public'));

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

router.get('/data/', (req, res) => {
  let urlParams = new URL(
    req.protocol + '://' + req.get('host') + req.originalUrl
  ).searchParams;
  fs.readFile('cache/' + urlParams.get('code') + '.json', (_err, data) => {
    if (urlParams.get('format') == 'json') {
      res.set('Content-Type', 'application/json');
    }
    if (data != undefined && data != '') {
      data = JSON.parse(data.toString());
      if (
        Date.now() - data['metadata']['updated'] < 2592000000 ||
        urlParams.get('force-preserve') == 'on'
      ) {
        data['metadata']['status'] =
          urlParams.get('force-preserve') == 'on' ? 'forced-normal' : 'normal';
        if (urlParams.get('format') == 'html') {
          res.send(util.toTable(data));
        } else if (urlParams.get('format') == 'json') {
          if (urlParams.get('year')) {
            if (urlParams.get('statistic')) {
              res.send(
                JSON.stringify(
                  data[urlParams.get('year')][urlParams.get('statistic')]
                )
              );
            } else {
              res.send(JSON.stringify(data[urlParams.get('year')]));
            }
          } else {
            res.send(JSON.stringify(data));
          }
        }
      } else {
        scraper.scrapeEnrollment(
          urlParams.get('code'),
          1994,
          2022,
          (newdata) => {
            fs.writeFile(
              'cache/' + urlParams.get('code') + '.json',
              JSON.stringify(newdata),
              () => {}
            );
            newdata['metadata']['status'] = 'updated';
            newdata['metadata']['updated-from'] = data['metadata']['updated'];
            if (urlParams.get('format') == 'html') {
              res.send(util.toTable(newdata));
            } else if (urlParams.get('format') == 'json') {
              if (urlParams.get('year')) {
                if (urlParams.get('statistic')) {
                  res.send(
                    JSON.stringify(
                      newdata[urlParams.get('year')][urlParams.get('statistic')]
                    )
                  );
                } else {
                  res.send(JSON.stringify(newdata[urlParams.get('year')]));
                }
              } else {
                res.send(JSON.stringify(newdata));
              }
            }
          }
        );
      }
    } else {
      scraper.scrapeEnrollment(urlParams.get('code'), 1994, 2022, (newdata) => {
        fs.writeFile(
          'cache/' + urlParams.get('code') + '.json',
          JSON.stringify(newdata),
          () => {}
        );
        newdata['metadata']['status'] = 'created';
        if (urlParams.get('format') == 'html') {
          res.send(util.toTable(newdata));
        } else if (urlParams.get('format') == 'json') {
          if (urlParams.get('year')) {
            if (urlParams.get('statistic')) {
              res.send(
                JSON.stringify(
                  newdata[urlParams.get('year')][urlParams.get('statistic')]
                )
              );
            } else {
              res.send(JSON.stringify(newdata[urlParams.get('year')]));
            }
          } else {
            res.send(JSON.stringify(newdata));
          }
        }
      });
    }
  });
});

app.use(process.env.BASE_URL ?? '/', router);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));

function scrape(index) {
  scraper.scrapeEnrollment(codes.codes[index], 1994, 2022, (newdata) => {
    console.log(
      'finished compiling data for district #' +
        (index + 1) +
        ' out of ' +
        codes.codes.length +
        '. Orgcode: ' +
        newdata['metadata']['code'] +
        '. Name: ' +
        newdata['metadata']['name'] +
        '. Non-op: ' +
        newdata['metadata']['non-op'] +
        '. Put in file: ' +
        'cache/' +
        newdata['metadata']['code'] +
        '.json.'
    );
    fs.writeFile(
      'cache/' + newdata['metadata']['code'] + '.json',
      JSON.stringify(newdata),
      () => {}
    );
    if (index < codes.codes.length - 1) {
      scrape((index += 1));
    }
  });
}

// scrape(519)
