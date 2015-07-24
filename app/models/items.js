exports.definition = {
	config: {
		columns: {
		    "i_id": "INTEGER",
		    "a_id": "INTEGER",
		    "price": "TEXT",
		    "barcode":  "INTEGER",
		    "caption": "TEXT",
		    "img_path": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "items"
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
			getItemByAds : function(a_id){
				var collection = this;
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE a_id='"+ a_id+ "'" ;
              // console.log(sql);
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                 while (res.isValidRow()){
                 	var caption = res.fieldByName('caption');
                 	if(caption != ""){
                 		caption = caption.replace(/&quot;/g,"'");
                 	} 
					arr[count] = {
						i_id: res.fieldByName('i_id'),
					    a_id: res.fieldByName('a_id'),
					    price: res.fieldByName('price'),
					    barcode: res.fieldByName('barcode'),
					    caption: caption,
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
			saveItem : function(i_id,a_id,price,barcode, caption, img_path){
				
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE i_id="+ i_id ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);  
                if(caption === null){
                	caption = "";
                }
                
                if(caption != ""){
                	caption = caption.replace(/["']/g, "&quot;");
                }
				
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET a_id=?, price=?,barcode=?, caption=?, img_path=? WHERE i_id=?";
             		db.execute(sql_query, a_id, price,barcode, caption, img_path, i_id);
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (i_id,a_id,price,barcode,caption, img_path) VALUES (?,?,?,?,?,?)" ;
                	db.execute(sql_query, i_id, a_id, price,barcode, caption, img_path);
				}
				
	            db.close();
	            collection.trigger('sync');
			},
			resetItem : function(a_id){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name +" WHERE a_id="+ a_id;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			},
		});

		return Collection;
	}
};