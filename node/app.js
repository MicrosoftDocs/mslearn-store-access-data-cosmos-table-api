const util = require("util");
const storage = require("azure-storage");

require("dotenv").config();

const tableService = storage.createTableService();
const entGen = storage.TableUtilities.entityGenerator;

const createTable = async tableName => {
  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(tableName, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const insertOrMergeEntity = async (tableName, entity) => {
  return new Promise((resolve, reject) => {
    tableService.insertOrMergeEntity(tableName, entity, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const queryTable = async (tableName, query) => {
  return new Promise((resolve, reject) => {
    tableService.queryEntities(tableName, query, null, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

const insertLens = async (
  tableName,
  lensType,
  partNumber,
  focalLength,
  aperture
) => {
  const entity = {
    PartitionKey: entGen.String(lensType),
    RowKey: entGen.String(partNumber),
    FocalLength: entGen.String(focalLength),
    Aperture: entGen.String(aperture)
  };

  return insertOrMergeEntity(tableName, entity);
};

(async () => {
  const tableName = "lensestable";
  const command = process.argv[2];
  console.log(command);
  if (command === "PopulateTable") {
    console.log("Creating the Lenses table...");
    await createTable(tableName, null);
    console.log("Table created. Populating...");
    await insertLens(tableName, "Prime", "X5018", "50mm", "f1.8");
    await insertLens(tableName, "Zoom", "X357035", "35-70mm", "f3.5");
    await insertLens(tableName, "Macro", "X10028", "100mm", "f2.8");
    console.log("Tables created and populated.");
  } else if (command === "DisplayTable") {
    console.log("Reading the contents of the Lenses table...");

    const logRow = a => {
      const space = [14, 20, 15, 10];
      console.log(
        "|" + a.map((e, i) => e.padStart(space[i], " ")).join(" |") + " |"
      );
    };

    try {
      const result = await queryTable(tableName, new storage.TableQuery());
      const header = ["Lens Type", "Part Number", "Focal Length", "Aperture"];
      logRow(header);
      for (const lens of result.entries) {
        logRow([
          lens.PartitionKey._,
          lens.RowKey._,
          lens.FocalLength._,
          lens.Aperture._
        ]);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
  } else if (command === "AddLens") {
    if (process.argv.length < 7) {
      console.log(
        "Usage: AddLens <LensType> <PartNumber> <FocalLength> <Aperture>"
      );
      return;
    }
    console.log(`Adding your ${process.argv[3]} lens...`);
    await insertLens(
      tableName,
      process.argv[3],
      process.argv[4],
      process.argv[5],
      process.argv[6]
    );
    console.log("Lens added.");
  }
})();
