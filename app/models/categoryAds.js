exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "m_id": "INTEGER",
		    "cate_id": "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "categoryAds"
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
			getLatestAdsByCategory : function(cate_id){
				var collection = this;
                //var sql = "SELECT * FROM " + collection.config.adapter.collection_name;
                var sql = "select a.m_id, a.updated, b.* from (SELECT merchants.m_id, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.cate_id = "+cate_id+" order by merchants.updated desc) as a left join ads as b on a.m_id = b.m_id limit 0, 1";
                //var sql = "select * from merchants";
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	for(var a = 0; a < row_count; a++){
                		//console.log(res.field(a));
                	}
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    //updated: res.fieldByName('updated'),
					    updated: res.field(1),
					    img_path: res.fieldByName('img_path'),
					    a_id: res.fieldByName('a_id'),
					    //cate_id: res.fieldByName('cate_id'),
					    //updated: res.fieldByName('updated')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			// extended functions and properties go here
			getCategoryAds : function(cate_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE cate_id='"+cate_id+"' ";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    cate_id: res.fieldByName('cate_id')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			resetCategoryAds : function(cate_id){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE cate_id='"+cate_id+"' ";
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			}
		});

		return Collection;
	}
};