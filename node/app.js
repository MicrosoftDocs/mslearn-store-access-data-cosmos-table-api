const util = require("util");
const AzureTables = require("@azure/data-tables");
const prompt = require('prompt-sync')({sigint: true});

require("dotenv").config();

//const tableService = storage.createTableService();
//const entGen = storage.TableUtilities.entityGenerator;

const tableName = "lensestable";

const { TableClient } = require("@azure/data-tables")
const tableClient = 
    TableClient.fromConnectionString(process.env.AZURE_TABLES_CONNECTION_STRING, tableName)


async function populateTable() {
    console.log("The Lenses table will be created if it does not exist");
    await tableClient.createTable();
    
    console.log("Adding data to the Lenses table...");
    await tableClient.upsertEntity( {partitionKey: "Prime", rowKey: "X5018", focalLength: "50mm", aperture: "f1.8"});
    await tableClient.upsertEntity( {partitionKey: "Zoom", rowKey: "X357035", focalLength: "35-70mm", aperture: "f3.5"});
    await tableClient.upsertEntity( {partitionKey: "Macro", rowKey: "X10028", focalLength: "100mm", aperture: "f2.8"});

    console.log("Table created and populated.");
}

async function displayTable() {
    console.log("Reading the contents of the Lenses table...");
    let entities = tableClient.listEntities();
    let i=1;
    for await (const entity of entities) {
      console.log(`${i}: Lens Type (PartitionKey): ${entity.partitionKey}  Part Number (RowKey): ${entity.rowKey}  Focal Length: ${entity.focalLength}  Aperture: ${entity.aperture}`);
      i++;
    }    
}


async function addLens() {
    const lensType = process.argv[3];
    const partNumber = process.argv[4];
    const focalLength = process.argv[5];
    const aperture = process.argv[6];

    console.log(`Adding ${lensType} to the Lenses table...`);
    await tableClient.upsertEntity( {partitionKey: lensType, rowKey: partNumber, focalLength: focalLength, aperture: aperture});
    console.log("Lens added.");
}


async function main() {
    const command = process.argv[2];
    if (command === "PopulateTable") {
      populateTable();
    } else if (command === "DisplayTable") {
      displayTable();
    } else if (command === "AddLens") {
      addLens();
    } else {
      console.log("Usage: node app.js (PopulateTable|DisplayTable|AddLens) <lens-type> <part-number> <focal-length> <aperture>");
    }
}

main();