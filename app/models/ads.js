exports.definition = {
	config: {
		columns: {
		    "a_id": "INTEGER PRIMARY KEY",
		    "m_id": "INTEGER",
		    "app_background": "TEXT",
		    "name": "TEXT",
		    "youtube": "TEXT",
		    "template_id": "INTEGER",
		    "description": "TEXT",
		    "img_path": "TEXT",
		    "status" : "INTEGER",
		    "branch": "TEXT",
		    "sales_from":"TEXT",
		    "sales_to":"TEXT",
		    "featured_date":"TEXT",
		    "active_date" : "TEXT",
		    "expired_date" : "TEXT",
		    "recommended": "INTEGER",	//1 - recommended, 2 - normal
		    "created" : "TEXT",
		    "express_date": "TEXT",
		    "tnc": "TEXT",
		    "updated" : "TEXT",
		    "category" : "INTEGER",
		    "img_thumb": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "ads",
			idAttribute: "a_id"
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
			getData: function(unlimit,keyword){
				console.log("ads model keyword:"+keyword);	
				var sql_keyword = (typeof keyword != "undefined" && keyword != "")?" AND name like '%"+keyword+"%'":"";
				var sql_limit = (unlimit)?"":"limit 0,6";
				var collection = this;
				var sql = "select ads.*, merchants.longitude, merchants.latitude, merchants.merchant_name as merchant_name from ads LEFT OUTER JOIN merchants ON merchants.m_id = ads.m_id where ads.status = 1 AND ( expired_date > date('now') OR expired_date = '0000-00-00') AND (active_date < date('now') OR active_date = '0000-00-00') AND ads.img_path != '' "+sql_limit+sql_keyword;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
				var count = 0;
                
                while (res.isValidRow()){
                	 var row_count = res.fieldCount;
                	 /*for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }
                	*/
                	arr[count] = {
                		a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    tnc: res.fieldByName('tnc'),
					    merchant_name: res.fieldByName('merchant_name'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName("latitude"),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    ads_name: res.fieldByName('name'),
					    active_date: res.fieldByName('active_date'),
					    youtube: res.fieldByName('youtube'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    img_path: res.fieldByName('img_path'),
					    description: res.fieldByName('description'),
					    status: res.fieldByName('status'),
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getExpressData: function(unlimit){
				var sql_limit = (unlimit)?"":"limit 0,6";
				var collection = this;
				var sql = "select ads.*, merchants.longitude, merchants.latitude, merchants.merchant_name as merchant_name from ads LEFT OUTER JOIN merchants ON merchants.m_id = ads.m_id where ads.status = 1 AND ads.m_id is not null AND express_date is not null AND ( expired_date > date('now') OR expired_date = '0000-00-00') AND (active_date <= date('now') OR active_date = '0000-00-00') AND ads.img_path != '' "+sql_limit;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
				console.log(sql);
                var res = db.execute(sql);
                var arr = [];
				var count = 0;
                
                while (res.isValidRow()){
                	 var row_count = res.fieldCount;
                	 for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }
                	
                	arr[count] = {
                		a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    merchant_name: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName("latitude"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    youtube: res.fieldByName('youtube'),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    expired_date: res.fieldByName('expired_date'),
					    express_date: res.fieldByName('express_date'),
					    updated: res.fieldByName('updated'),
					    img_path: res.fieldByName('img_path'),
					    description: res.fieldByName('description'),
					    status: res.fieldByName('status'),
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getBannerList: function(){
				var u_id = Ti.App.Properties.getString('u_id') || "";
				
				var collection = this;
				var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
	            var d = COMMON.todayDateTime();
	            d = d.split(" ")[0];
				var sql = "select * from ads where (','||featured_date||',') LIKE '%,"+d+",%' AND ( expired_date >= date('now') OR expired_date = '0000-00-00') AND (active_date <= date('now') OR active_date = '0000-00-00') AND status = 1 ORDER BY updated DESC";
				console.log(sql);
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
                
				var count = 0;
                
                var eval_column = "";
            	for (var i=0; i < names.length; i++) {
					eval_column = eval_column+names[i]+": res.fieldByName('"+names[i]+"'),";
				};
                /*
                var row_count = res.fieldCount;
            	for(var a = 0; a < row_count; a++){
            		console.log(a+":"+res.fieldName(a)+":"+res.field(a));
            	}*/
                
                while (res.isValidRow()){
                	eval("arr[count] = {"+eval_column+"}");
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getDataByBranch: function(m_id, start, end){
				var collection = this;
				var sql = "select ads.*, merchants.longitude, merchants.latitude, merchants.merchant_name as merchant_name from ads LEFT OUTER JOIN merchants ON merchants.m_id = ads.m_id where (',' || ads.branch || ',') LIKE '%,"+m_id+",%' AND ads.status = 1 AND ( expired_date > date('now') OR expired_date = '0000-00-00') AND (active_date <= date('now') OR active_date = '0000-00-00') AND ads.img_path != '' limit "+start+", "+end;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
				var count = 0;
                
                while (res.isValidRow()){
                	 var row_count = res.fieldCount;
                	 /*for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
                	
                	arr[count] = {
                		a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    merchant_name: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName("latitude"),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    youtube: res.fieldByName('youtube'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    img_path: res.fieldByName('img_path'),
					    description: res.fieldByName('description'),
					    status: res.fieldByName('status'),
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getDataByStore: function(m_id, start, end){
				var collection = this;
				var sql = "select ads.*, merchants.longitude, merchants.latitude, merchants.merchant_name as merchant_name from ads, merchants where merchants.m_id = ads.m_id AND (ads.m_id = ? OR merchants.parent = ?) AND ads.status = 1 AND ( expired_date > date('now') OR expired_date = '0000-00-00') AND (active_date <= date('now') OR active_date = '0000-00-00') AND ads.img_path != '' limit "+start+", "+end;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql, m_id, m_id);
                var arr = [];
				var count = 0;
                
                while (res.isValidRow()){
                	 var row_count = res.fieldCount;
                	 /*for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
                	
                	arr[count] = {
                		a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    //merchant: res.fieldByName('merchant_name').replace(/&quot;/g, "'"),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName("latitude"),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    ads_name: res.fieldByName('name').replace(/&quot;/g, "'"),
					    active_date: res.fieldByName('active_date'),
					    branch: res.fieldByName("branch"),
					    youtube: res.fieldByName('youtube'),
					    expired_date: res.fieldByName('expired_date'),
					    updated: res.fieldByName('updated'),
					    img_path: res.fieldByName('img_path'),
					    description: res.fieldByName('description'),
					    status: res.fieldByName('status'),
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getAdsInfo : function(a_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE a_id='"+ a_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
               // console.log(sql);
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					     a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    name: res.fieldByName('name'),
					    app_background: res.fieldByName('app_background'),
					    youtube: res.fieldByName('youtube'),
					    description: res.fieldByName('description'),
					    template: res.fieldByName('template'),
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
			getAdsByMerchantAndAds : function(m_id){
				var collection = this;
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "'" ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    name: res.fieldByName('name'),
					    app_background: res.fieldByName('app_background'),
					    youtube: res.fieldByName('youtube'),
					    description: res.fieldByName('description'),
					    template: res.fieldByName('template'),
					    img_path: res.fieldByName('img_path')
					};
				}
				
				// console.log(arr );
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getAdsById : function(a_id){
				var collection = this;
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE a_id='"+ a_id+ "' AND status=1 order by updated desc" ;
                //console.log(sql);
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    tnc: res.fieldByName("tnc"),
					    name: res.fieldByName('name'),
					    app_background: res.fieldByName('app_background'),
					    youtube: res.fieldByName('youtube'),
					    branch: res.fieldByName('branch'),
					    sales_from: res.fieldByName("sales_from"),
					    sales_to: res.fieldByName("sales_to"),
					    description: res.fieldByName('description'),
					    template_id: res.fieldByName('template_id'),
					    img_path: res.fieldByName('img_path')
					};
					
				} 
				// console.log(arr );
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getAdsByMid : function(m_id){
				console.log(m_id);
				var collection = this;
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "' AND status=1 AND ( expired_date > date('now') OR expired_date = '0000-00-00') AND (active_date <= date('now') OR active_date = '0000-00-00') order by updated desc" ;
                //console.log(sql);
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
                	var row_count = res.fieldCount;
                	
                	 /*for(var a = 0; a < row_count; a++){
                		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
                	 }*/
					arr = {
					    a_id: res.fieldByName('a_id'),
					    m_id: res.fieldByName('m_id'),
					    name: res.fieldByName('name'),
					    app_background: res.fieldByName('app_background'),
					    youtube: res.fieldByName('youtube'),
					    description: res.fieldByName('description'),
					    template_id: res.fieldByName('template_id'),
					    img_path: res.fieldByName('img_path')
					};
					
				} 
				// console.log(arr );
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" (a_id, m_id, app_background,name,youtube,template_id,description,img_path,status,active_date,expired_date,created,updated, recommended, branch, express_date, tnc, sales_to, sales_from,featured_date,category,img_thumb) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.a_id, entry.m_id, entry.app_background,entry.name,entry.youtube,entry.template_id,entry.description,entry.img_path,entry.status,entry.activate,entry.expired,entry.created,entry.updated, entry.recommended, entry.branch, entry.express_date, entry.tnc, entry.sales_to, entry.sales_from, entry.featured_date, entry.category, entry.img_thumb);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
			searchAds: function(data) {
				var sql = "SELECT merchants.merchant_name, ads.a_id, ads.name, ads.img_path, ads.sales_to FROM merchants INNER JOIN ads ON merchants.m_id = ads.m_id AND ads.sales_to >= date('now') AND ads.status = 1 AND ads.name LIKE '%" + data + "%'";
				db = Ti.Database.open(this.config.adapter.db_name);
				
				if(Ti.Platform.osname != "android"){
					db.file.setRemoteBackup(false);
				}
				
				var res = db.execute(sql);
				var arr = [];
				var count = 0;
				
				while (res.isValidRow()){
					arr[count] = {
						a_id: res.fieldByName('a_id'),
						img_path: res.fieldByName('img_path'),
						name: res.fieldByName('name'),
						merchants_name: res.fieldByName('merchant_name')
					};
					res.next();
					count++;
				}
				
				res.close();
				db.close();
				return arr;
			},
		});

		
	}
};