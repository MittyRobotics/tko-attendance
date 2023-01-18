import supabase from "./supabase-setup";
var fs = require("fs");
const { parse } = require("csv-parse");

async function parseCSV() {
  fs.createReadStream("./data.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      const { data, error } = await supabase
        .from("users")
        .update([{ unique_id: "00" + row[1] }])
        .match({ name: row[0] });
      console.log("done with row " + row[0]);
    });
}

parseCSV();

module.exports = parseCSV;
