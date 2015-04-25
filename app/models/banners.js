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
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
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
			getExistingId : function(){
				var collection = this;
                var sql = "SELECT b_id FROM " + collection.config.adapter.collection_name ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var bannerArr = []; 
                var count = 0;
                while (res.isValidRow()){
					bannerArr.push(res.fieldByName('b_id'));
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return bannerArr.join(",");
			},
			saveBanner : function(entry) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE b_id="+ entry.b_id + " AND m_id='"+entry.b_uid+"' "  ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET expired='"+entry.b_enddate+"', img='"+entry.img_thumb+"' WHERE b_id="+ entry.b_id + " AND m_id='"+entry.b_uid+"' "  ;
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (b_id, m_id, expired,img) VALUES ('"+entry.b_id+"','"+entry.b_uid+"','"+entry.b_enddate+"','"+entry.img_thumb+"')" ;
				}
           
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            },
            removeBanner : function(entry){
            	 var collection = this;
            	 db = Ti.Database.open(collection.config.adapter.db_name);
            	 sql_query = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE b_id in ("+ entry+")";
            	db.execute(sql_query);
            	console.log(sql_query);
	            db.close();
	            collection.trigger('sync');
            },
			resetBanner : function(){
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