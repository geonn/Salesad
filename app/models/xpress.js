exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "u_id": "INTEGER",
		    "category": "INTEGER",
		    "status": "INTEGER",	//1 - publish, 2 - unpublish, 3 - deleted
		    "name": "TEXT",
		    "description": "TEXT",
		    "store_name": "TEXT",
		    "address": "TEXT",
		    "latitude": "TEXT",
		    "longitude": "TEXT",
		    "img_path": "TEXT",
		    "owner_img_path": "TEXT",
		    "owner_name": "TEXT",
		    "expired_date" : "DATE",
		    "sales_from" : "DATE",
		    "sales_to" : "DATE",
		    "created" : "DATE",
		    "updated" : "DATE"
		},
		adapter: {
			type: "sql",
			collection_name: "xpress",
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
	            
	            if(e.latest){
					var start_limit = "";
					var sql_lastupdate = " AND created > '"+e.anchor+"'";
				}else{
					var start_limit = " limit "+e.start+", 8";
					var sql_lastupdate = " AND created <= '"+e.anchor+"'";
				}
				var sql_uid = "";
				console.log(e);
				if(typeof e.u_id != "undefined"){
					sql_uid = " AND u_id = "+e.u_id;
				}
	            var sql_keyword = (typeof e.keyword != "undefined" && e.keyword != "")?" AND description like '%"+e.keyword+"%'":"";
	            var sql_category = (typeof e.category_id != "undefined")?" AND category = '"+e.category_id+"'":"";
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name+" WHERE status = 1 "+sql_lastupdate+sql_category+sql_keyword+sql_uid+" order by `updated` DESC "+start_limit;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                console.log(sql);
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
	                				console.log(name+" "+k);
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
				//console.log(db.getRowsAffected()+" affected row");
	            db.close();
	            collection.trigger('sync');
			},
		});

		
	}
};