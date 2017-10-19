exports.definition = {
	config: {
		columns: {
			"id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "m_id": "INTEGER",
		    "merchant_name": "TEXT",
		    "marchant_thumb": "TEXT",
		    "status": "INTEGER",
		    "u_id": "INTEGER",
		    "position": "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "favorites",
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
			getFavoritesByUid : function(uid){
				var collection = this;
                var sql = "SELECT favorites.* FROM " + collection.config.adapter.collection_name + " WHERE favorites.u_id='"+ uid+ "' AND favorites.m_id != '' order by favorites.position" ;
              
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
                var count = 0;
               
                while (res.isValidRow()){
					arr[count] = {
						id: res.fieldByName('id'),
						m_id: res.fieldByName('m_id'),
						position: res.fieldByName('position'),
					  	u_id: res.fieldByName('u_id'),
					  	merchant_name: res.fieldByName('merchant_name'),
					  	marchant_thumb: res.fieldByName('marchant_thumb')
					};
					res.next();
					count++;
				} 
               
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
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
			getFavoritesWithAdsByUid : function(uid){
				var collection = this;
                var sql = "SELECT favorites.* FROM " + collection.config.adapter.collection_name + " WHERE favorites.u_id='"+ uid+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
               
                while (res.isValidRow()){
					arr[count] = {
						id: res.fieldByName('id'),
						m_id: res.fieldByName('m_id'),
						position: res.fieldByName('position'),
					  	u_id: res.fieldByName('u_id'),
					  	name: res.fieldByName('name'),
					  	img_path: res.fieldByName('img_path')
					};
					res.next();
					count++;
				} 
                
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			checkFavoriteExist : function(m_id, u_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE u_id=? AND m_id='"+m_id+"'" ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql, u_id);
                
                if(res.isValidRow()){
                	var m_id = res.fieldByName('m_id');
                	res.close();
                	db.close();
                	return m_id;
                }else{
                	res.close();
                	db.close();
                	return false;
                }
                res.close();
                db.close();
			},
			deleteFavorite : function(m_id, u_id){
				var collection = this;
		        var sql = "DELETE FROM " + collection.config.adapter.collection_name+" where u_id=? AND m_id=?";
		       
		        var db2 = Ti.Database.open(collection.config.adapter.db_name);
		        if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
		        db2.execute(sql, u_id, m_id);
		        db2.close();
		        collection.trigger('sync');
			},
			deleteFavoriteByMid : function(m_id, u_id){
				var collection = this;
		        var sql = "DELETE FROM " + collection.config.adapter.collection_name+" where u_id=? AND m_id="+m_id;
		       
		        var db2 = Ti.Database.open(collection.config.adapter.db_name);
		        if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
		        db2.execute(sql, u_id);
		        db2.close();
		        collection.trigger('sync');
			},
			resetFavorites : function(){
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
			saveArray : function(arr){ // 5th version of save array by adrian
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
			updatePosition : function(id, position){
				var collection = this;
				var sql = "UPDATE " + collection.config.adapter.collection_name + " SET position='"+position+"' WHERE id='" +id+"'";
		        db = Ti.Database.open(collection.config.adapter.db_name);
		        if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
		        db.execute(sql);
		        db.close();
			}
		});

		return Collection;
	}
};