function syncMySQLToGoogleSheets() {
  // Define MySQL connection details
  var server = 'sql12.freemysqlhosting.net';
  var dbName = 'sql12731412';
  var username = 'sql12731412';
  var password = 'TijHb9Y6XF';
  var port = 3306;

  // Establish the JDBC connection
  var url = 'jdbc:mysql://' + server + ':' + port + '/' + dbName;
  var conn;

  try {
    conn = Jdbc.getConnection(url, username, password);
    Logger.log('Connection to MySQL successful!');

    // Get the active Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear(); // Clear the existing content in the sheet

    // Define the query to fetch data from the database
    var query = 'SELECT * FROM example_table';
    var stmt = conn.createStatement();
    var results = stmt.executeQuery(query);

    // Set headers in the sheet
    var headers = ['ID', 'Name', 'Email'];
    sheet.appendRow(headers);

    // Process the result set and write it to the sheet
    while (results.next()) {
      var id = results.getInt('id');
      var name = results.getString('name');
      var email = results.getString('email');
      sheet.appendRow([id, name, email]);
    }

    stmt.close();
    Logger.log('Data successfully synced from MySQL to Google Sheets.');

  } catch (e) {
    Logger.log('Error: ' + e.message);
  } finally {
    if (conn) {
      conn.close();  // Ensure the connection is closed
    }
  }
}


function syncGoogleSheetsToMySQL() {
  // Define MySQL connection details
  var server = 'sql12.freemysqlhosting.net';
  var dbName = 'sql12731412';
  var username = 'sql12731412';
  var password = 'TijHb9Y6XF';
  var port = 3306;

  // Establish the JDBC connection
  var url = 'jdbc:mysql://' + server + ':' + port + '/' + dbName;
  var conn;

  try {
    conn = Jdbc.getConnection(url, username, password);
    Logger.log('Connection to MySQL successful!');

    // Get the active Google Sheet and data
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();  // Get all the data from the sheet

    // Check if the header row matches the expected format
    var headers = data[0];
    if (headers[0] !== 'ID' || headers[1] !== 'Name' || headers[2] !== 'Email') {
      Logger.log('Error: Google Sheet structure does not match the expected format.');
      return; // Exit the function if the structure is incorrect
    }

    // Process the data rows (skip the header row)
    for (var i = 1; i < data.length; i++) {
      var id = data[i][0];    // ID
      var name = data[i][1];  // Name
      var email = data[i][2]; // Email

      if (id) {
        // Check if the record exists
        var checkQuery = 'SELECT COUNT(*) AS count FROM example_table WHERE id = ?';
        var checkStmt = conn.prepareStatement(checkQuery);
        checkStmt.setInt(1, id);
        var result = checkStmt.executeQuery();
        result.next();
        var exists = result.getInt('count') > 0;
        checkStmt.close();

        if (exists) {
          // If the record exists, update it
          var updateQuery = `
            UPDATE example_table
            SET name = ?, email = ?
            WHERE id = ?;
          `;
          var updateStmt = conn.prepareStatement(updateQuery);
          updateStmt.setString(1, name);
          updateStmt.setString(2, email);
          updateStmt.setInt(3, id);
          var rowsAffected = updateStmt.executeUpdate();
          Logger.log('Updated entry with ID: ' + id + ', Rows affected: ' + rowsAffected);
          updateStmt.close();
        } else {
          // If the record does not exist, insert it
          var insertQuery = `
            INSERT INTO example_table (id, name, email)
            VALUES (?, ?, ?);
          `;
          var insertStmt = conn.prepareStatement(insertQuery);
          insertStmt.setInt(1, id);
          insertStmt.setString(2, name);
          insertStmt.setString(3, email);
          var rowsAffected = insertStmt.executeUpdate();
          Logger.log('Inserted new entry: ID=' + id + ', Name=' + name + ', Rows affected: ' + rowsAffected);
          insertStmt.close();
        }
      }
    }

  } catch (e) {
    Logger.log('Error: ' + e.message);
  } finally {
    if (conn) {
      conn.close();  // Ensure the connection is closed
    }
  }
}


