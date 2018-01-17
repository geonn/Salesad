exports.definition = {
	config: {
		columns: {
			"id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "m_id": "INTEGER", 
		    "a_id": "INTEGER",
		    "updated": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "feeds"
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
			getSalesFeed : function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " order by updated DESC" ;
                
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
					    a_id: res.fieldByName('a_id'),
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
			updateUserFeeds : function(m_id,a_id) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id="+ m_id + " AND a_id='" + a_id +"' ";
                var sql_query =  "";
                var now = new Date(); 
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET updated='"+COMMON.todayDateTime()+"' WHERE m_id='"+m_id+"' AND a_id='" +a_id+"'";
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (m_id, a_id, updated) VALUES ('"+m_id+"','"+a_id+"','"+COMMON.todayDateTime()+"')" ;
				}
     
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            }
		});

		return Collection;
	}
};