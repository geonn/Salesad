exports.definition = {
	config: {
		columns: {
		    "b_id": "INTEGER",
		    "m_id": "INTEGER",
		    "expired": "TEXT",
		    "img": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "banners"
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
			getBannerList : function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                var res = db.execute(sql);
                var bannerArr = []; 
                var count = 0;
                while (res.isValidRow()){
					bannerArr[count] = {
					    b_id: res.fieldByName('b_id'),
					    m_id: res.fieldByName('m_id'),
					    expired: res.fieldByName('expired'),
					    img: res.fieldByName('img')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return bannerArr;
			},
			
			resetBanner : function(){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name;
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