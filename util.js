var tableStyles = `
*{box-sizing:border-box}
table{min-width:100%}
table,tr,td,th{border:3px solid black;border-collapse:collapse;background:#fff}
tr:nth-child(even) td{background:#ddd}
td,th{padding:5px;text-align:center}
thead th{background:#bbf}`

function withoutProperty(obj, property) {
    const { [property]: unused, ...rest } = obj

    return rest
}

function toTable(json) {
    let metadata = json["metadata"]
    json = withoutProperty(json, "metadata");
    let rows = Object.keys(json);
    let columns = {};
    let allCols = [];
    for (let i = 0; i < rows.length; i++) {
        let row = json[rows[i]];
        let rowKeys = Object.keys(row);
        for (let j = 0; j < rowKeys.length; j++) {
            let column = row[rowKeys[j]]
            let columnKeys = Object.keys(column)
            if (columnKeys.length > 0) {
                if (columns[rowKeys[j]] == undefined) {
                    columns[rowKeys[j]] = []
                }
                for (let k = 0; k < columnKeys.length; k++) {
                    if (columns[rowKeys[j]].indexOf(columnKeys[k]) == -1 && row[rowKeys[j]] != "No Data") {
                        columns[rowKeys[j]].push(columnKeys[k])
                    }
                }
            } else {
                if (columns[rowKeys[j]] == undefined) {
                    columns[rowKeys[j]] = [rowKeys[j]]
                }
            }
        }
    }

    let theadOne = "<thead><tr><th>Year</th>"
    let theadTwo = "</tr><th>Year</th>"

    for (let i = 0; i < Object.keys(columns).length; i++) {
        theadOne += `<th colspan="${columns[Object.keys(columns)[i]].length}">${Object.keys(columns)[i]}</th>`
    }
    for (let i = 0; i < Object.keys(columns).length; i++) {
        theadTwo += "<th>" + columns[Object.keys(columns)[i]].join("</th><th>") + "</th>"
        allCols.push(columns[Object.keys(columns)[i]])
    }

    let tbody = "<tbody>"
    for (let i = 0; i < rows.length; i++) {
        tbody += `<tr><td>${rows[i]}</td>`
        let baseCols = Object.keys(columns);
        let rowData = []
        for (let j = 0; j < baseCols.length; j++) {
            if (typeof (json[rows[i]][baseCols[j]]) == "object") {
                let subColumns = columns[baseCols[j]]
                for (let k = 0; k < subColumns.length; k++) {
                    if (json[rows[i]][baseCols[j]][subColumns[k]] !== undefined) {
                        if (json[rows[i]][baseCols[j]][subColumns[k]] == "-")
                            rowData.push(json[rows[i]][baseCols[j]][subColumns[k]])
                        else
                            rowData.push(Math.round(parseFloat(json[rows[i]][baseCols[j]][subColumns[k]]) / parseInt(json[rows[i]]["Total"]) * 1000) / 10 + "%")
                    } else {
                        rowData.push("No Data")
                    }
                }
            } else if (typeof (json[rows[i]][baseCols[j]]) == "number") {
                rowData.push(json[rows[i]][baseCols[j]])
            } else if (typeof (json[rows[i]][baseCols[j]]) == "string" || typeof (json[rows[i]][baseCols[j]]) == "undefined") {
                let subColumns = columns[baseCols[j]]
                for (let k = 0; k < subColumns.length; k++) {
                    rowData.push("No Data")
                }
            }
        }
        tbody += `<td>${rowData.join("</td><td>")}</tr>`
    }

    let updatedFrom
    let updated = new Date(metadata["updated"])
    if (metadata["status"] == "updated") updatedFrom = new Date(metadata["updated-from"])

    return `<style>${tableStyles}</style><a href="../">Home</a> | <span>Status: "${metadata["status"]}"${(metadata["status"] == "updated") ? " from \"" + updatedFrom.toUTCString() + "\"" : ""} | Data From: "${updated.toUTCString()}" | For District: "${metadata["name"]}" | District Code: "${metadata["code"]}" | Non-op? "${metadata["non-op"] ? "Yes" : "No"}"</span><table>${theadOne + theadTwo + "</tr></thead>"}${tbody + "</tbody>"}</table>`
}

exports.withoutProperty = withoutProperty;
exports.toTable = toTable;