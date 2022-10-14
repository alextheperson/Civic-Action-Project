const express = require('express');
const fs = require('fs');
const url = require('url');
const scraper = require('./scraper.js');
const codes = require('./school-districts.js');
const util = require('./util.js');

const app = express();
const passkey = `ocnh#HJn761542!`

// https://civic-action-project.alextheperson.repl.co/json/?code=04450000&year=2022&statistic=Enrollment%20by%20Race/Ethnicity

app.use(express.static('public'))

app.get('/data/', (req, res) => {
    let urlParams = new URL(req.protocol + '://' + req.get('host') + req.originalUrl).searchParams;
    fs.readFile("cache/" + urlParams.get("code") + ".json", (_err, data) => {
        if (urlParams.get("format") == "json") {
            res.set('Content-Type', 'application/json');
        }
        if (data != undefined && data != "") {
            data = JSON.parse(data.toString());
            if (Date.now() - data["metadata"]["updated"] < 60000 || (urlParams.get("force-update") == "on" && urlParams.get("passkey") == passkey) || urlParams.get("force-preserve") == "on") {
                data["metadata"]["status"] = (urlParams.get("force-preserve") == "on") ? "forced-normal" : "normal";
                if (urlParams.get("format") == "html") res.send(util.toTable(data));
                else if (urlParams.get("format") == "json") {
                    if (urlParams.get("year")) {
                        if (urlParams.get("statistic")) {
                            res.send(JSON.stringify(data[urlParams.get("year")][urlParams.get("statistic")]));
                        } else {
                            res.send(JSON.stringify(data[urlParams.get("year")]));
                        }
                    } else {
                        res.send(JSON.stringify(data));
                    }
                }
            } else {
                scraper.scrapeEnrollment(urlParams.get("code"), 1994, 2022, (newdata) => {
                    fs.writeFile("cache/" + urlParams.get("code") + ".json", JSON.stringify(newdata), () => { });
                    newdata["metadata"]["status"] = (urlParams.get("force-update") == "on" && urlParams.get("passkey") == passkey) ? "forced-updated" : "updated";
                    newdata["metadata"]["updated-from"] = data["metadata"]["updated"];
                    if (urlParams.get("format") == "html") res.send(util.toTable(newdata));
                    else if (urlParams.get("format") == "json") {
                        if (urlParams.get("year")) {
                            if (urlParams.get("statistic")) {
                                res.send(JSON.stringify(newdata[urlParams.get("year")][urlParams.get("statistic")]));
                            } else {
                                res.send(JSON.stringify(newdata[urlParams.get("year")]));
                            }
                        } else {
                            res.send(JSON.stringify(newdata));
                        }
                    }
                })
            }
        } else {
            scraper.scrapeEnrollment(urlParams.get("code"), 1994, 2022, (newdata) => {
                fs.writeFile("cache/" + urlParams.get("code") + ".json", JSON.stringify(newdata), () => { });
                newdata["metadata"]["status"] = "created";
                if (urlParams.get("format") == "html") res.send(util.toTable(newdata));
                else if (urlParams.get("format") == "json") {
                    if (urlParams.get("year")) {
                        if (urlParams.get("statistic")) {
                            res.send(JSON.stringify(newdata[urlParams.get("year")][urlParams.get("statistic")]));
                        } else {
                            res.send(JSON.stringify(newdata[urlParams.get("year")]));
                        }
                    } else {
                        res.send(JSON.stringify(newdata));
                    }
                }
            })
        }
    });
});

app.listen(3000, () => {
    console.log('server started');
});

function scrape(index) {
    scraper.scrapeEnrollment(codes.codes[index], 1994, 2022, (newdata) => {
        console.log("finished compiling data for district #" + (index + 1) + " out of " + codes.codes.length + ". Orgcode: " + newdata["metadata"]["code"] + ". Name: " + newdata["metadata"]["name"] + ". Non-op: " + newdata["metadata"]["non-op"] + ". Put in file: " + "cache/" + newdata["metadata"]["code"] + ".json.");
        fs.writeFile("cache/" + newdata["metadata"]["code"] + ".json", JSON.stringify(newdata), () => { });
        if (index < codes.codes.length - 1) {
            scrape(index += 1)
        }
    })
}

// scrape(519)