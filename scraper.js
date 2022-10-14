const axios = require('axios');
const cheerio = require('cheerio');

function sortObj(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function placeRound(num, pow) {
    return Math.round(num / 10 ** pow) * 10 ** pow
}

function scrapeEnrollment(code, startYear, endYear, cb) {
    data = {
        "metadata": {
            "updated": Date.now(),
            "code": code
        }
    };
    let numre = 0
    let numge = 0
    let numsp = 0
    for (let i = startYear; i <= endYear; i++) {
        axios.get(`https://profiles.doe.mass.edu/profiles/student.aspx?orgcode=${code}&orgtypecode=5&&fycode=${i}`)
            .then((response) => {
                if (response.status === 200) {
                    let html = response.data;
                    let $ = cheerio.load(html);
                    let tables = $(".t_detail");

                    numre += 1;
                    numge += 1;

                    if (tables.length == 0) {
                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Enrollment by Race/Ethnicity": "No Data",
                                "Enrollment by Gender": "No Data"
                            }
                        }
                        else {
                            data[i.toString()]["Enrollment by Race/Ethnicity"] = "No Data";
                            data[i.toString()]["Enrollment by Gender"] = "No Data";
                        }
                    } else {
                        var re = {};
                        var ge = {};
                        var total = 0;

                        $("tbody", ".t_detail:nth-of-type(2)").children("tr").each((index, row) => {
                            if (index > 1 && index < $("tbody", ".t_detail:nth-of-type(2)").children("tr").length - 1) ge[$("td:nth-child(1)", row).text()] = parseInt($("td:nth-child(2)", row).text().trim().replace(",", ""));
                            if (index == $("tbody", ".t_detail:nth-of-type(2)").children("tr").length - 1) total = parseInt($("td:nth-child(2)", row).text().trim().replace(",", ""));
                        });
                        $("tbody", ".t_detail:nth-of-type(1)").children("tr").each((index, row) => {
                            if (index > 1) {
                                re[$("td:nth-child(1)", row).text()] = placeRound(parseFloat($("td:nth-child(2)", row).text().trim().replace(",", "")) / 100 * total, 0);
                            }
                        });

                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Enrollment by Race/Ethnicity": re,
                                "Enrollment by Gender": ge,
                                "Total": total
                            }
                        }
                        else {
                            data[i.toString()]["Enrollment by Race/Ethnicity"] = re
                            data[i.toString()]["Enrollment by Gender"] = ge
                            data[i.toString()]["Total"] = total
                        }
                    }
                    checkForEnd();
                }
            })
        axios.get(`https://profiles.doe.mass.edu/profiles/student.aspx?orgcode=${code}&orgtypecode=5&leftNavId=305&&fycode=${i}`)
            .then((response) => {
                if (response.status === 200) {
                    let html = response.data;
                    let $ = cheerio.load(html);
                    let tables = $(".t_detail");

                    numsp += 1;

                    if (tables.length == 0) {
                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Selected Populations": "No Data"
                            }
                        }
                        else {
                            data[i.toString()]["Selected Populations"] = "No Data"
                        }
                    } else {
                        var sp = {};

                        $("tbody", ".t_detail:nth-of-type(1)").children("tr").each((index, row) => {
                            if (index > 0 && $("td:nth-child(1)", row).text() != "") {
                                sp[$("td:nth-child(1)", row).text()] = $("td:nth-child(2)", row).text().trim().replace(",", "");
                            }
                        });

                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Selected Populations": sp
                            }
                        }
                        else {
                            data[i.toString()]["Selected Populations"] = sp
                        }
                    }

                    let headerText = $(".header1").text().split(' (');

                    data["metadata"]["name"] = headerText[0]

                    if (headerText[1] == "non-op)") data["metadata"]["non-op"] = true;
                    else data["metadata"]["non-op"] = false;

                    checkForEnd()
                }
            })
    }

    function checkForEnd() {
        if ((numre == (endYear - startYear) + 1) && (numge == (endYear - startYear) + 1) && (numsp == (endYear - startYear) + 1)) {
            for (let j = startYear; j <= endYear; j++) {
                selectedPops = data[j.toString()]["Selected Populations"];
                for (let k = 0; k < Object.keys(selectedPops).length; k++) {
                    if (selectedPops[Object.keys(selectedPops)[k]] != "-") {
                        selectedPops[Object.keys(selectedPops)[k]] = placeRound(parseFloat(selectedPops[Object.keys(selectedPops)[k]]) / 100 * parseInt(data[j.toString()]["Total"]), 0);
                    }
                }
            }
            cb(sortObj(data));
        }
    }
}

function scrapeMCAS(code, startYear, endYear, cb) {
    data = {
        "metadata": {
            "updated": Date.now(),
            "code": code
        }
    };
    let numre = 0
    let numge = 0
    let numsp = 0
    for (let i = startYear; i <= endYear; i++) {
        axios.get(`https://profiles.doe.mass.edu/profiles/student.aspx?orgcode=${code}&orgtypecode=5&&fycode=${i}`)
            .then((response) => {
                if (response.status === 200) {
                    let html = response.data;
                    let $ = cheerio.load(html);
                    let tables = $(".t_detail");

                    numre += 1;
                    numge += 1;

                    if (tables.length == 0) {
                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Enrollment by Race/Ethnicity": "No Data",
                                "Enrollment by Gender": "No Data"
                            }
                        }
                        else {
                            data[i.toString()]["Enrollment by Race/Ethnicity"] = "No Data";
                            data[i.toString()]["Enrollment by Gender"] = "No Data";
                        }
                    } else {
                        var re = {};
                        var ge = {};
                        var total = 0;

                        $("tbody", ".t_detail:nth-of-type(2)").children("tr").each((index, row) => {
                            if (index > 1 && index < $("tbody", ".t_detail:nth-of-type(2)").children("tr").length - 1) ge[$("td:nth-child(1)", row).text()] = parseInt($("td:nth-child(2)", row).text().trim().replace(",", ""));
                            if (index == $("tbody", ".t_detail:nth-of-type(2)").children("tr").length - 1) total = parseInt($("td:nth-child(2)", row).text().trim().replace(",", ""));
                        });
                        $("tbody", ".t_detail:nth-of-type(1)").children("tr").each((index, row) => {
                            if (index > 1) {
                                re[$("td:nth-child(1)", row).text()] = placeRound(parseFloat($("td:nth-child(2)", row).text().trim().replace(",", "")) / 100 * total, 0);
                            }
                        });

                        if (data[i.toString()] === undefined) {
                            data[i.toString()] = {
                                "Enrollment by Race/Ethnicity": re,
                                "Enrollment by Gender": ge,
                                "Total": total
                            }
                        }
                        else {
                            data[i.toString()]["Enrollment by Race/Ethnicity"] = re
                            data[i.toString()]["Enrollment by Gender"] = ge
                            data[i.toString()]["Total"] = total
                        }
                    }
                    checkForEnd();
                }
            })
    }

    function checkForEnd() {
        if ((numre == (endYear - startYear) + 1) && (numge == (endYear - startYear) + 1) && (numsp == (endYear - startYear) + 1)) {
            cb(sortObj(data));
        }
    }
}

exports.sortKeys = sortObj;
exports.scrapeEnrollment = scrapeEnrollment;