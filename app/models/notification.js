

exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "u_id": "INTEGER",
		    "subject": "TEXT",
		    "url" : "TEXT", 
		    "is_read" : "TEXT",
		    "extra" : "TEXT",
		    "target" : "TEXT",
		    "created" : "TEXT",
		    "updated" : "TEXT",
		    "status" : "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "notification"
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
			getList : function(e){
				var collection = this;
				var columns = collection.config.columns;
				
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
                db = Ti.Database.open(collection.config.adapter.db_name); 
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE u_id=? AND status=1 ORDER BY id DESC" ;
                
                var res = db.execute(sql, e.u_id);
                var arr = []; 
                var count = 0;
                
                var eval_column = "";
            	for (var i=0; i < names.length; i++) {
					eval_column = eval_column+names[i]+": res.fieldByName('"+names[i]+"'),";
				};
				
				while (res.isValidRow()){
                	var row_data = {};
	            	for (var i=0; i < names.length; i++) {
	            		row_data[ names[i] ] = res.fieldByName(names[i]);
					};
                	arr[count] = row_data;
                	res.next();
					count++;
                }
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getCountUnread : function(e){
				var collection = this;
                var u_id = Ti.App.Properties.getString('u_id') || 0;
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT COUNT(*) AS total FROM " + collection.config.adapter.collection_name + " WHERE u_id=? and is_read='0' and status = 1" ;
               console.log(sql);
                var res = db.execute(sql, u_id);
                var listArr =0;
                while (res.isValidRow()){
					listArr = res.fieldByName('total'); 
					res.next();
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return listArr;
			},
			setIdAsRead: function(entry){
				console.log(entry);
				var collection = this;
				db = Ti.Database.open(collection.config.adapter.db_name);
				var sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET is_read=1 WHERE id=? ";
				console.log(entry.id+" "+sql_query);
				db.execute(sql_query, entry.id); 
				db.close();
	            collection.trigger('sync');
			},
			update_status: function(entry){
				var collection = this;
				db = Ti.Database.open(collection.config.adapter.db_name);
				var sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET status=? WHERE id=? ";
				db.execute(sql_query, entry.status, entry.id); 
				db.close();
	            collection.trigger('sync');
			},
			saveArray : function(arr){ // 5.1th version of save array by onn
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
                arr.forEach(function(entry) {
                	var keys = [];
                	var eval_values = [];
                	for(var k in entry){
	                	if (entry.hasOwnProperty(k)){
	                		_.find(names, function(name){
	                			if(name == k){
	                				keys.push(k);
	                				entry[k] = (entry[k] == null)?"":entry[k];
	                				entry[k] = entry[k].replace(/'/g, "\\'");
			                		eval_values.push("\""+entry[k]+"\"");
	                			}
	                		});
	                	}
                	}
		            var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" ("+keys.join()+") VALUES ("+eval_values.join()+")";
		            console.log(sql_query);
		            db.execute(sql_query);
				});
	            db.close();
	            collection.trigger('sync');
			},
			addData : function(entry) {
				console.log("add data");
				console.log(entry);
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id=? ";
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                var res = db.execute(sql, entry.id);
             
                if (res.isValidRow()){  
                	if(entry.from == "push"){
                		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET member_no=?, subject=?, message=? , url=? ,status=? ,  isRead=?, expired=?, updated=?, detail=? WHERE id=? ";
                		 db.execute(sql_query, entry.member_no, entry.subject, entry.message, entry.url, parseInt(entry.status), entry.isRead, entry.expired, entry.updated, entry.detail, entry.id);
                	}else{
                		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET member_no=?, subject=?, message=? , url=? ,status=?,  expired=?, updated=?, detail=? WHERE id=? ";
                		 db.execute(sql_query, entry.member_no, entry.subject, entry.message, entry.url, parseInt(entry.status), entry.expired, entry.updated, entry.detail, entry.id);
                	}
             		
                }else{
                	sql_query = "INSERT INTO "+ collection.config.adapter.collection_name + "(id, member_no, subject, message, url,isRead, expired,status,detail,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
 					db.execute(sql_query, parseInt(entry.id), entry.member_no, entry.subject , entry.message, entry.url, "0", entry.expired, parseInt(entry.status), entry.detail, entry.created, entry.updated);
				}
				//console.log(sql_query);
               
	            db.close();
	            collection.trigger('sync');
            } 
		});

		return Collection;
	}
};