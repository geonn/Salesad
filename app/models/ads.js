exports.definition = {
	config: {
		columns: {
		    "a_id": "INTEGER",
		    "m_id": "INTEGER",
		    "b_id": "INTEGER",
		    "ads_background": "TEXT",
		    "ads_name": "TEXT",
		    "template": "TEXT",
		    "desc": "TEXT",
		    "img_path": "TEXT",
		    "status" : "INTEGER",
		    "active_date" : "TEXT",
		    "expired_date" : "TEXT",
		    "created" : "TEXT",
		    "updated" : "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "ads"
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
					    b_id: res.fieldByName('b_id'),
					    ads_name: res.fieldByName('ads_name'),
					    ads_background: res.fieldByName('ads_background'),
					    youtube: res.fieldByName('youtube'),
					    desc: res.fieldByName('desc'),
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
			getAdsByMerchantAndAds : function(m_id, a_id){
				var collection = this;
				
				if(a_id != ""){
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "' AND b_id='"+a_id+"' " ;
				}else{
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "'" ;
                }
    
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
					    b_id: res.fieldByName('b_id'),
					    ads_name: res.fieldByName('ads_name'),
					    ads_background: res.fieldByName('ads_background'),
					    youtube: res.fieldByName('youtube'),
					    desc: res.fieldByName('desc'),
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
			getAdsById : function(m_id, b_id){
				var collection = this;
				
				if(b_id != ""){
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "' AND b_id='"+b_id+"' " ;
				}else{
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "'" ;
                }
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
					    b_id: res.fieldByName('b_id'),
					    ads_name: res.fieldByName('ads_name'),
					    ads_background: res.fieldByName('ads_background'),
					    youtube: res.fieldByName('youtube'),
					    desc: res.fieldByName('desc'),
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
			saveAds : function(a_id,m_id,b_id,ads_name,template,desc,ads_background,youtube, img_path, status, active_date, expired_date, created, updated){
			//console.log("start save ad"); 
				ads_name = ads_name.replace(/["']/g, "&quot;");
					
				var needRefresh = false;
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+"' AND b_id='"+b_id+ "'" ;
                //console.log(sql);
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                
                var res = db.execute(sql);
                 
                if (res.isValidRow()){ 
                	//console.log(res.fieldByName('updated')+" "+updated+" "+ads_name);
                	if(res.fieldByName('ads_name') != ads_name || res.fieldByName('template') != template || res.fieldByName('desc') != desc || res.fieldByName('ads_background') != ads_background || res.fieldByName('img_path') != img_path || res.fieldByName('youtube') != youtube || res.fieldByName('status') != status || res.fieldByName('active_date') != active_date || res.fieldByName('expired_date') != expired_date || res.fieldByName('created') != created || res.fieldByName('updated') != updated){
                		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET a_id='"+a_id+"', ads_name='"+ads_name+"', template='"+template+"', desc='"+desc+"', img_path='"+img_path+"', ads_background='"+ads_background+"', youtube='"+youtube+"', status='"+status+"', active_date='"+active_date+"', expired_date='"+expired_date+"', created='"+created+"', updated='"+updated+"' WHERE m_id="+ m_id+" AND b_id='"+b_id+ "'" ;
                		needRefresh = true;
                		db.execute(sql_query); 
                		 
                	}
                }else{ 
                	needRefresh = true;
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (a_id,m_id,b_id,ads_name,template,  desc, ads_background,youtube, img_path, status, active_date, expired_date, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                	db.execute(sql_query, a_id, m_id, b_id, ads_name, template, desc, ads_background, youtube, img_path, status,  active_date,  expired_date, created, updated); 
				} 
	           
	            db.close();
	            
	            // mdb = Ti.Database.open("merchants");
	            // msql_query = "UPDATE merchants set updated = CURRENT_TIMESTAMP where m_id = "+m_id;
// 	            
	            // mdb.execute(msql_query);
	            // mdb.close();
	            collection.trigger('sync');
	            return needRefresh;
			}
		});

		
	}
};