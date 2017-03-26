exports.definition = {
	config: {
		columns: {
		    "m_id": "INTEGER PRIMARY KEY",
		    "cate_id": "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "categoryAds",
			idAttribute: "m_id"
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
			getData: function(){
				var collection = this;
				var sql = "select * from "+collection.config.adapter.db_name;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
				var count = 0;
                
                while (res.isValidRow()){
                	arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    merchant: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    youtube: res.fieldByName('youtube'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    //updated: res.field(1),
					    img_path: res.fieldByName('img_path'),
					    a_id: res.fieldByName('a_id')
					};
					
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getLatestAdsByCategory : function(cate_id, start, end, m_id){
				var limit = limit || false;
				var collection = this;
				if(typeof(m_id) != "undefined"){
					var sql = "select a.m_id, a.merchant_name, a.updated, b.* from (SELECT merchants.m_id, merchants.merchant_name, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.m_id in ( "+m_id+") order by merchants.updated desc) as a, ads as b WHERE a.m_id = b.m_id and b.status = 1 AND ( b.expired_date > date('now') OR b.expired_date = '0000-00-00') order by b.updated desc limit "+start+", "+end+"";
				}else{
					var sql = "select a.m_id, a.merchant_name, b.updated, b.* from (SELECT categoryAds.m_id, merchants.merchant_name FROM categoryAds LEFT OUTER JOIN merchants ON merchants.m_id = categoryAds.m_id WHERE categoryAds.cate_id = "+cate_id+" order by merchants.updated desc) as a, ads as b WHERE a.m_id = b.m_id and b.status = 1 AND ( b.expired_date > date('now') OR b.expired_date = '0000-00-00') order by b.updated desc limit "+start+", "+end;
					
                }
                //var sql = "SELECT * FROM " + collection.config.adapter.collection_name;
                //sql = "SELECT merchants.m_id, merchants.merchant_name, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.cate_id = "+cate_id+" order by merchants.updated desc";
                //sql = "SELECT categoryAds.*, merchants.* FROM categoryAds LEFT OUTER JOIN merchants ON merchants.m_id = categoryAds.m_id WHERE categoryAds.cate_id = "+cate_id+" order by merchants.updated desc";	
                //sql = "select * from merchants";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
				db.execute("PRAGMA automatic_index=off;");
                var res = db.execute(sql);
                var arr = [];
                var count = 0;
                
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	 /*
                	 for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }
                	*/
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    merchant_name: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    youtube: res.fieldByName('youtube'),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    //updated: res.field(1),
					    img_path: res.fieldByName('img_path'),
					    a_id: res.fieldByName('a_id')
					};
					
					res.next();
					count++;
				} 
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getAdsList : function(){
				var limit = limit || false;
				var collection = this;
                var sql = "select a.m_id, a.merchant_name, a.latitude, a.longitude, a.updated, b.* from (SELECT merchants.latitude, merchants.longitude, merchants.m_id, merchants.merchant_name, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id order by merchants.updated desc) as a, ads as b WHERE a.m_id = b.m_id and b.status = 1 order by b.updated desc";
                
                //var sql = "SELECT * FROM " + collection.config.adapter.collection_name;
                //var sql = "select * from merchants";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	/* for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    merchant: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    //updated: res.field(1),
					    latitude: res.fieldByName('latitude'),
		    			longitude: res.fieldByName('longitude'),
					    img_path: res.fieldByName('img_path'),
					    a_id: res.fieldByName('a_id')
					};
					res.next();
					count++;
				} 
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getPopularAdsByCategory : function(cate_id, limit){
				var limit = limit || false;
				var collection = this;
                if(limit){
                	//sql = "SELECT merchants.m_id FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.cate_id = "+cate_id+" order by merchants.updated desc";
                	var sql = "select a.m_id, a.merchant_name, a.updated, b.* from (SELECT merchants.m_id, merchants.merchant_name, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.cate_id = "+cate_id+" order by merchants.updated desc) as a, ads as b, popular as c WHERE a.m_id = b.m_id and b.status = 1 and c.m_id = a.m_id order by c.id desc limit 0,1";
                }else{
                	var sql = "select a.m_id, a.merchant_name, a.updated, b.* from (SELECT merchants.m_id, merchants.merchant_name, merchants.updated FROM " + collection.config.adapter.collection_name + ", merchants WHERE merchants.m_id = categoryAds.m_id and categoryAds.cate_id = "+cate_id+" order by merchants.updated desc) as a, ads as b, popular as c WHERE a.m_id = b.m_id and b.status = 1 and c.m_id = a.m_id order by c.id";
                }
                
                //var sql = "SELECT * FROM " + collection.config.adapter.collection_name;
                //var sql = "select * from merchants";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	/* for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    merchant: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    //updated: res.field(1),
					    img_path: res.fieldByName('img_path'),
					    a_id: res.fieldByName('a_id')
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
                var sql = "SELECT ca.*, m.img_path, m.merchant_name FROM categoryAds as ca LEFT OUTER JOIN merchants as m on m.m_id = ca.m_id WHERE ca.cate_id='"+cate_id+"' AND m.merchant_name is not null AND m.parent is null ";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    cate_id: res.fieldByName('cate_id'),
					    img_path: res.fieldByName('img_path'),
					    merchant_name: res.fieldByName('merchant_name'),
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getAllCategory : function(){
				var collection = this;
                var sql = "SELECT categoryAds.*, merchants.* FROM " + collection.config.adapter.collection_name + " LEFT OUTER JOIN merchants on merchants.m_id = categoryAds.m_id ";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	/* for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
					arr[count] = {
					    m_id: res.fieldByName('m_id'),
					    cate_id: res.fieldByName('cate_id'),
					    name: res.fieldByName('name'),
					    img_path: res.fieldByName('img_path'),
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
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
			removeCategoryAds : function(entry){
				var collection = this;
            	db = Ti.Database.open(collection.config.adapter.db_name);
            	sql_query = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE id in ("+ entry+")";
            	db.execute(sql_query);
            	//console.log(sql_query);
	            db.close();
	            collection.trigger('sync');
			},
			saveCategoryAds : function(m_id, categoryName){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                 
                if (res.isValidRow()){ 
                	if(res.fieldByName('categoryName') != categoryName){
                		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET categoryName='"+categoryName+"' WHERE id="+ id;
                		db.execute(sql_query); 
                	}
                }else{ 
                	needRefresh = true;
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (id, categoryName) VALUES ('"+id+"','"+categoryName+"')";
                	db.execute(sql_query); 
				} 
	            db.close();
	            collection.trigger('sync');
			},
			saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (m_id, cate_id) VALUES (?,?)";
					db.execute(sql_query, entry.m_id, entry.cate_id);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET cate_id=? WHERE m_id=?";
					db.execute(sql_query, entry.cate_id, entry.m_id);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
			resetCategoryAds : function(cate_id){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name + " WHERE cate_id='"+cate_id+"' ";
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