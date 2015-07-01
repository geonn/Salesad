exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "categoryName": "INTEGER",
		    "image": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "category",
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
			getCategoryList : function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var categoryArr = []; 
                var count = 0;
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	 for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }
					categoryArr[count] = {
					    id: res.fieldByName('id'),
					    categoryName: res.fieldByName('categoryName'),
					    image: res.fieldByName('image')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return categoryArr;
			},
			getExistingId : function(){
				var collection = this;
                var sql = "SELECT id FROM " + collection.config.adapter.collection_name ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var categoryArr = []; 
                var count = 0;
                while (res.isValidRow()){
					categoryArr.push(res.fieldByName('id'));
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return categoryArr.join(",");
			},
			getCategoryById : function(cate_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+ cate_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    categoryName: res.fieldByName('categoryName'),
					    image: res.fieldByName('image')
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			removeCategory : function(entry){
				var collection = this;
            	db = Ti.Database.open(collection.config.adapter.db_name);
            	sql_query = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE id in ("+ entry+")";
            	db.execute(sql_query);
            	console.log(sql_query);
	            db.close();
	            collection.trigger('sync');
			},
			saveCategory : function(id, categoryName, image){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+ id+"'";
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                if (res.isValidRow()){ 
                	if(res.fieldByName('categoryName') != categoryName || res.fieldByName('image') != image){
                		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET categoryName='"+categoryName+"', image='"+image+"' WHERE id="+ id;
                		db.execute(sql_query); 
                	}
                }else{ 
                	needRefresh = true;
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (id, categoryName, image) VALUES ('"+id+"','"+categoryName+"','"+image+"')";
                	db.execute(sql_query); 
				} 
				console.log(sql_query);
	            db.close();
	            collection.trigger('sync');
			},
			resetCategory : function(){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name;
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