exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "name": "TEXT",
		    "description": "TEXT",
		    "merchant_id": "INTEGER",
		    "merchant_name": "TEXT",
		    "status": "INTEGER",		//1 - publish, 2 - unpublish
		    "img_path": "TEXT",
		    "preview_url": "TEXT",
		    "expired": "DATETIME",
		    "created" : "DATETIME",
		    "updated" : "DATETIME"
		},
		adapter: {
			type: "sql",
			collection_name: "contest",
			idAttribute: "id"
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
			addColumn : function( newFieldName, colSpec) {
				var collection = this;
				var db = Ti.Database.open(collection.config.adapter.db_name);
				if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
				var fieldExists = false;
				resultSet = db.execute('PRAGMA TABLE_INFO(' + collection.config.adapter.collection_name + ')');
				while (resultSet.isValidRow()) {
					if(resultSet.field(1)==newFieldName) {
						fieldExists = true;
					}
					resultSet.next();
				}  
			 	if(!fieldExists) { 
					db.execute('ALTER TABLE ' + collection.config.adapter.collection_name + ' ADD COLUMN '+newFieldName + ' ' + colSpec);
				}
				db.close();
			},
			getData : function(start, limit){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name+" WHERE status = 1 order by `updated` DESC limit "+start+", "+limit;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
               // console.log(sql);
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    name: res.fieldByName('name'),
					    description: res.fieldByName('description'),
					    merchant_id: res.fieldByName('merchant_id'),
					    merchant_name: res.fieldByName('merchant_name'),
					    merchant: res.fieldByName('merchant_name'),
					    ads_name: res.fieldByName('name'),
					    status: res.fieldByName('status'),
					    img_path: res.fieldByName('img_path'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    youtube: "",
					    m_id: res.fieldByName('merchant_id'),
					    a_id: 0,
					};
					res.next();
					count++;
				}
				res.close();
                db.close();
                
                collection.trigger('sync');
                return arr;
			},
			getDataById : function(id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name+" WHERE status = 1 AND id=? order by `updated`";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
               // console.log(sql);
                var res = db.execute(sql, id);
                var arr; 
                var count = 0;
                if (res.isValidRow()){
					arr = {
					    id: res.fieldByName('id'),
					    name: res.fieldByName('name'),
					    description: res.fieldByName('description'),
					    merchant_id: res.fieldByName('merchant_id'),
					    merchant_name: res.fieldByName('merchant_name'),
					    merchant: res.fieldByName('merchant_name'),
					    ads_name: res.fieldByName('name'),
					    status: res.fieldByName('status'),
					    img_path: res.fieldByName('img_path'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    youtube: "",
					    m_id: res.fieldByName('merchant_id'),
					    a_id: 0,
					};
				}
				res.close();
                db.close();
                
                collection.trigger('sync');
                return arr;
			},
			saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
                	var keys = [];
                	var questionmark = [];
                	var eval_values = [];
                	var update_questionmark = [];
                	var update_value = [];
                	for(var k in entry){
	                	if (entry.hasOwnProperty(k)){
	                		keys = _.keys(entry);
	                		questionmark.push("?");
	                		eval_values.push("entry."+k);
	                		update_questionmark.push(k+"=?");
	                	}
                	}
                	var without_pk_list = _.rest(update_questionmark);
	                var without_pk_value = _.rest(eval_values);
	                
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" ("+keys.join()+") VALUES ("+questionmark.join()+")";
	                eval("db.execute(sql_query, "+eval_values.join()+")");
	                
	                var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET "+without_pk_list.join()+" WHERE "+_.first(update_questionmark);
	                eval("db.execute(sql_query, "+without_pk_value.join()+","+_.first(eval_values)+")");
				});
				db.execute("COMMIT");
				console.log(db.getRowsAffected()+" affected row");
	            db.close();
	            collection.trigger('sync');
			},
		});

		
	}
};