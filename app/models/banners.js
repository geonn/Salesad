exports.definition = {
	config: {
		columns: {
		    "b_id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		   	"m_id": "INTEGER",
		    "b_name": "TEXT",
		    "b_uid": "INTEGER",
		    "b_type": "INTEGER",
		    "b_status": "INTEGER",
		    "b_startdate": "TEXT",
		    "b_enddate": "TEXT",
		    "img_path": "TEXT",    
		},
		adapter: {
			type: "sql",
			collection_name: "banners",
			idAttribute: "b_id"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
			getBannerList : function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" WHERE b_status = 1 AND ( b_enddate > date('now') OR b_enddate = '0000-00-00')" ;

                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var bannerArr = []; 
                var count = 0;   
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	/*for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
					bannerArr[count] = {
					    b_id: res.fieldByName('b_id'),
					    m_id: res.fieldByName('m_id'),
					    b_name: res.fieldByName('b_name'),
					    b_uid: res.fieldByName('b_uid'),
					    b_type: res.fieldByName('b_type'),
					    b_status: res.fieldByName('b_status'),
					    b_startdate: res.fieldByName('b_startdate'),
					    b_enddate: res.fieldByName('b_enddate'),
					    img_path: res.fieldByName('img_path')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                console.log(bannerArr);
                return bannerArr;
			},
			getExistingId : function(){
				var collection = this;
                var sql = "SELECT b_id FROM " + collection.config.adapter.collection_name ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var bannerArr = []; 
                var count = 0;
                while (res.isValidRow()){
					bannerArr.push(res.fieldByName('b_id'));
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return bannerArr.join(",");
			},
			saveBanner : function(entry) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE b_id="+ entry.b_id;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);  
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET m_id=?, b_name=?,b_uid=?,b_type=?,b_status=?,b_startdate=?,b_enddate=?,img_path=? WHERE b_id=?";
             		db.execute(sql_query, entry.m_id, entry.b_name,entry.b_uid,entry.b_type,entry.b_status,entry.b_startdate,entry.b_enddate,entry.img_path,entry.b_id);
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (b_id, m_id, b_name,b_uid,b_type,b_status,b_startdate,b_enddate,img_path) VALUES (?,?,?,?,?,?,?,?,?)";
                	db.execute(sql_query, entry.b_id, entry.m_id, entry.b_name,entry.b_uid,entry.b_type,entry.b_status,entry.b_startdate,entry.b_enddate,entry.img_path);
				}
	            db.close();
	            collection.trigger('sync');
            },
            removeBanner : function(entry){
            	 var collection = this;
            	 db = Ti.Database.open(collection.config.adapter.db_name);
            	 sql_query = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE b_id in ("+ entry+")";
            	db.execute(sql_query);
            	console.log(sql_query);
	            db.close();
	            collection.trigger('sync');
            },
            saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (b_id, m_id, b_name,b_uid,b_type,b_status,b_startdate,b_enddate,img_path) VALUES (?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.b_id, entry.m_id, entry.b_name, entry.b_uid, entry.b_type, entry.b_status, entry.b_startdate, entry.b_enddate, entry.img_path);
					var sql_query = "UPDATE "+collection.config.adapter.collection_name+" SET m_id=?, b_name=?,b_uid=?,b_type=?,b_status=?,b_startdate=?,b_enddate=?,img_path=? WHERE b_id=?";
					db.execute(sql_query, entry.m_id, entry.b_name, entry.b_uid, entry.b_type, entry.b_status, entry.b_startdate, entry.b_enddate, entry.img_path, entry.b_id);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
			resetBanner : function(){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				 }
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			},
			dropTable : function(){
				var collection = this;
                var sql = "DROP TABLE IF EXISTS " + collection.config.adapter.collection_name;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				 }
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			},
			createTable : function(){
       			var collection = this;
				var config = Collection.prototype.config;
				var columns = [];
				for (var k in config.columns) {
		            k === this.idAttribute && (found = !0);
		            columns.push(k + " " + column(config.columns[k]));
		        }
				console.log(columns.join(", "));
                var sql =  "CREATE TABLE IF NOT EXISTS " +  collection.config.adapter.collection_name + " ( " + columns.join(', ') + ")";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				 }
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			}
		});
		return Collection;
	}
};

var column = function(name) {
    var parts = name.split(/\s+/), type = parts[0];
    switch (type.toLowerCase()) {
      case "string":
      case "varchar":
      case "date":
      case "datetime":
        Ti.API.warn("\"" + type + "\" is not a valid sqlite field, using TEXT instead");
      case "text":
        type = "TEXT";
        break;
      case "int":
      case "tinyint":
      case "smallint":
      case "bigint":
      case "boolean":
        Ti.API.warn("\"" + type + "\" is not a valid sqlite field, using INTEGER instead");
      case "integer":
        type = "INTEGER";
        break;
      case "double":
      case "float":
      case "decimal":
      case "number":
        Ti.API.warn("\"" + name + "\" is not a valid sqlite field, using REAL instead");
      case "real":
        type = "REAL";
        break;
      case "blob":
        type = "BLOB";
        break;
      case "null":
        type = "NULL";
        break;
      default:
        type = "TEXT";
    }
    parts[0] = type;
    return parts.join(" ");
};