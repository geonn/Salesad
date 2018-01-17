exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "m_id": "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "recent"
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
			getRecentList : function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name ;
                
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
					    m_id: res.fieldByName('m_id')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			
			resetRecent : function(){
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