window.submissionsDao  = function() {
  var db = null;
  var dataId = 1;

  var sql = {
    CREATE : "CREATE TABLE submissions (id REAL UNIQUE, json TEXT)",
    INSERT : "INSERT INTO submissions (id, json ) VALUES ( ?, ?)",
    UPDATE : "UPDATE submissions SET json = ? WHERE id = ?",
    GET : "SELECT json FROM submissions",
    COUNT : "SELECT COUNT(*) FROM submissions"
  }

  function initDB( _callback ) {
    console.log("Setting up database");
    try {
      if ( window.openDatabase ) {
        db = openDatabase("Storage", "0.1", "Submissions Database", 2200000);
        checkIfSchemaInitialized();
        if ( !db ) {
          console.log( "Failed to open the database. Have you allocated enough space?" );
        } else {
          if ( typeof _callback === "function" ) {
            _callback.apply({}, []);
          }
        }
      }
    } catch( error ) {
      console.log( "Error trying to open database : " + error );
    }
  }

  function checkIfSchemaInitialized() {
    console.log("Checking if schema is loaded");
    db.transaction(
      function(tx) {
      tx.executeSql( sql.COUNT, [],
        function(tx, result) {
          // do nothing
        },
        function( tx, error) {
          tx.executeSql( sql.CREATE, [],
          function(result) {
            // create our single row
            tx.executeSql( sql.INSERT, [ dataId, "[]" ]);
          });
      });
    });
  }

  function load( _callback) {
    db.transaction(function(tx) {
      tx.executeSql( sql.GET, [], function(tx, result) {
        if (result.rows.length > 0) {
          var _row = result.rows.item(0);
          var _json = _row['json'];
          if ( typeof _callback === "function" ) {
            _callback.apply( {}, [ _json ] );
          }
        }
      }, function(tx, error) {
        console.log( "Failed to retrieve submissions from database - " + error.message );
        return;
      });
    });
  };

  function save( _json, _callback ) {
    db.transaction(function (tx) {
      tx.executeSql( sql.UPDATE, [ _json, dataId ], _callback);
    });
  };
  
  return {
    init : initDB,
    load : load,
    save : save
  };
}();

window.onload = function() {
  submissionsDao.init( function() {
    // we have succesffuly loaded.
    submissionsDao.load( function( text ) {
      var dataDiv = document.getElementById( "data" ).value = text;
    });
  });
};

function saveToDb() {
  var dataDiv = document.getElementById( "data" );
  submissionsDao.save( dataDiv.value );
}
