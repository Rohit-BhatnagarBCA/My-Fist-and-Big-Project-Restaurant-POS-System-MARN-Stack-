require("dotenv").config();

const connectDB =
  require("../config/database");

const Table =
  require("../models/tableModel");

const run = async () => {
  try {
    await connectDB();

    console.log(
      "\nChecking Table indexes...\n"
    );

    const indexes =
      await Table.collection.getIndexes();

    console.log(
      "Existing indexes:",
      Object.keys(
        indexes
      )
    );

    if (
      indexes.tableNo_1
    ) {
      console.log(
        "Dropping old tableNo_1 index..."
      );

      await Table.collection.dropIndex(
        "tableNo_1"
      );

      console.log(
        "✅ Old tableNo_1 index removed."
      );
    } else {
      console.log(
        "ℹ️ tableNo_1 index not found."
      );
    }

    // Make sure intended indexes exist.
    await Table.syncIndexes();

    console.log(
      "\n✅ Table indexes are now correct."
    );

    const finalIndexes =
      await Table.collection.getIndexes();

    console.log(
      "Final indexes:",
      Object.keys(
        finalIndexes
      )
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Index cleanup failed:"
    );

    console.error(
      error
    );

    process.exit(1);
  }
};

run();