exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "categoryName": "INTEGER"
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
					categoryArr[count] = {
					    id: res.fieldByName('id'),
					    categoryName: res.fieldByName('categoryName')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return categoryArr;
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
					    categoryName: res.fieldByName('categoryName')
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
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