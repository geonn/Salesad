exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "u_id": "INTEGER",
		    "points": "INTEGER",
		    "purpose": "INTEGER",
		    "balance": "INTEGER",
		    "type": "TEXT", 	//add or minus
		    "created" : "DATE",
		    "updated" : "DATE"
		},
		adapter: {
			type: "sql",
			collection_name: "points",
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
			getData : function(e){
				var collection = this;
				var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
	            var sql_u_id = (typeof e.u_id != "undefined")?" AND u_id = "+e.u_id:"";
	            var sql_daily = (typeof e.daily != "undefined")?" AND created >= datetime('now', '-24 hours')":"";
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name+" WHERE 1=1 "+sql_u_id+sql_daily;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                
                var eval_column = "";
            	for (var i=0; i < names.length; i++) {
					eval_column = eval_column+names[i]+": res.fieldByName('"+names[i]+"'),";
				};
                while (res.isValidRow()){
                	eval("arr[count] = {"+eval_column+"}");
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
			saveArray : function(arr){ // 4th version of save array
				var collection = this;
				var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
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
	                		_.find(names, function(name){
	                			if(name == k){
	                				keys.push(k);
			                		questionmark.push("?");
			                		eval_values.push("entry."+k);
			                		update_questionmark.push(k+"=?");
	                			}
	                		});
	                	}
                	}
                	var without_pk_list = _.rest(update_questionmark);
	                var without_pk_value = _.rest(eval_values);
	                var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" ("+keys.join()+") VALUES ("+questionmark.join()+")";
	                eval("db.execute(sql_query, "+eval_values.join()+")");
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
		});

		
	}
};