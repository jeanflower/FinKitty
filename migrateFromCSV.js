import fs from 'fs';
import {loadJsonFile} from 'load-json-file';
import { parse } from "csv-parse";
import dateFormat from "dateformat";

(async () => {
  const model = await loadJsonFile('../model.json');
  model.monitors = [];
  /*
  model.expenses.map((e) => {
    console.log(`e.NAME = ${e.NAME}`);
  })
  return;
  */

  console.log(`model = ${JSON.stringify(model)}`);
  let record;
  fs.createReadStream("../Budgets-Table 1.csv")
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", (row) => {
    // console.log(row);
    records.push(row);
  })
  .on("end", () => {
    // iterate over montns
    for(let i = 0; i < records[0].length; i = i + 1) {
      if (i < 4) {
        continue;
      }
      const month = records[0][i];
      if(month === 'All time average'){
        break;
      }
      console.log(`month = ${month}`);
      const date = new Date(`01 ${month}`);
      const dateCheck = dateFormat(date, 'mmm yyyy');
      if(dateCheck !== month) {
        console.log(`month !== formatted; ${month} !== ${dateCheck}`);
        continue;
      }
      // iterate over rows
      for(const row of records) {
        if(row[0] === 'Category'){
          continue;
        }
        if(row[0] === 'Monthly total'){
          break;
        }
        const matchedExpense = model.expenses.find((e) => {
          return e.NAME === category;
        });
        if(matchedExpense === undefined) {
          console.log(`no matchedExpense for ${category}`);
          break;
        }
        let matchedMonitor = model.monitors.find((e) => {
          return e.NAME === category;
        });
        if(!matchedMonitor){
          model.monitors.push({
            NAME: category,
            VALUES: [],
          });
        }
        matchedMonitor = model.monitors.find((e) => {
          return e.NAME === category;
        });
        const val = row[i];
        matchedMonitor.VALUES.push({
          MONTH: month,
          EXPRESSION: val,
        })
        console.log(`category = ${category} val = ${val}`);
      }
    }
    // console.log(`model = ${JSON.stringify(model)}`);
    fs.writeFile('../newModel.json', JSON.stringify(model), (err) => { 
      if (err) 
        console.log(err); 
      else { 
        console.log("File written successfully\n"); 
      } 
    });
  });

  const records = [];
  // Initialize the parser
  const parser = parse({
    delimiter: ':'
  });
  // Use the readable stream api to consume records
  parser.on('readable', function(){
    while ((record = parser.read()) !== null) {
    }
  });
  // Catch any error
  parser.on('error', function(err){
    console.error(err.message);
  });
  // Test that the parsed records matched the expected records
  parser.on('end', function(){
  });
  // Write data to the stream
  // parser.write("root:x:0:0:root:/root:/bin/bash\n");
  // parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n");
  // Close the readable stream
  parser.end();
})();