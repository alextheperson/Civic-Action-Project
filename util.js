const pug = require('pug');

var tableStyles = `
*{box-sizing:border-box}
table{min-width:100%}
table,tr,td,th{border:3px solid black;border-collapse:collapse;background:#fff}
tr:nth-child(even) td{background:#ddd}
td,th{padding:5px;text-align:center}
thead th{background:var(--accent)}`

function withoutProperty(obj, property) {
	const { [property]: unused, ...rest } = obj

	return rest
}

function toTable(json) {
	var resultsPage = pug.compileFile('public/table.pug');

	newJson = withoutProperty(json, "metadata");
	let rows = Object.keys(newJson);
	let columns = {};
	for (let i = 0; i < rows.length; i++) {
		let row = newJson[rows[i]];
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

	// return `<style>${tableStyles}</style><a href="../">Home</a> | <span>Status: "${metadata["status"]}"${(metadata["status"] == "updated") ? " from \"" + updatedFrom.toUTCString() + "\"" : ""} | Data From: "${updated.toUTCString()}" | For District: "${metadata["name"]}" | District Code: "${metadata["code"]}" | Non-op? "${metadata["non-op"] ? "Yes" : "No"}"</span><table>${theadOne + theadTwo + "</tr></thead>"}${tbody + "</tbody>"}</table>`
	return resultsPage({ "results": json, "columns": columns, "rows": rows })
}

exports.withoutProperty = withoutProperty;
exports.toTable = toTable;