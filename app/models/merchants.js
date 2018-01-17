exports.definition = {
	config: {
		columns: {
		    "m_id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "u_id": "INTEGER",
		    "parent": "INTEGER",
		    "merchant_name": "TEXT",
		    "mobile": "TEXT",
		    "area": "TEXT",
		    "address": "TEXT",
		    "state_key": "TEXT",
		    "state_name": "TEXT",
		    "longitude": "TEXT",
		    "latitude" : "TEXT",
		    "updated": "TEXT", 
		    "img_path": "TEXT",
		    'is_featured': "INTEGER",
		    'status': "INTEGER",
		},
		adapter: {
			type: "sql",
			collection_name: "merchants",
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
			getMerchantsById : function(m_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                //	return;
                var res = db.execute(sql);
                var arr = []; 
                
                if (res.isValidRow()){
					arr = {
						m_id: res.fieldByName('m_id'),
						u_id: res.fieldByName('u_id'),
					    merchant_name: res.fieldByName('merchant_name'),
					    area: res.fieldByName('area'),
					    mobile: res.fieldByName('mobile'),
					    state_key: res.fieldByName('state_key'),
					    state_name: res.fieldByName('state_name'),
					    img_path: res.fieldByName('img_path'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					    is_featured: res.fieldByName('is_featured'),
					    parent:  res.fieldByName('parent'),
					    status: res.fieldByName('status'),
					};
				} 
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getBranchesByMerchant : function(u_id,showAll){
				var collection = this;
				if(showAll != "false"){
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE parent='"+ u_id+ "'" ; 
				}else{
					var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ u_id+ "'" ; 
				}
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                //	return;
               var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					   m_id: res.fieldByName('m_id'),
						u_id: res.fieldByName('u_id'),
					    merchant_name: res.fieldByName('merchant_name'),
					    area: res.fieldByName('area'),
					    mobile: res.fieldByName('mobile'),
					    state_key: res.fieldByName('state_key'),
					    state_name: res.fieldByName('state_name'),
					    img_path: res.fieldByName('img_path'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					    is_featured: res.fieldByName('is_featured'),
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
			getBranchesById : function(id){
				var collection = this;
				
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id in ("+id+")" ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                //	return;
               var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					   m_id: res.fieldByName('m_id'),
						u_id: res.fieldByName('u_id'),
					    merchant_name: res.fieldByName('merchant_name'),
					    area: res.fieldByName('area'),
					    mobile: res.fieldByName('mobile'),
					    state_key: res.fieldByName('state_key'),
					    state_name: res.fieldByName('state_name'),
					    img_path: res.fieldByName('img_path'),
					    address: res.fieldByName('address'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					    is_featured: res.fieldByName('is_featured'),
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
            saveMerchants : function(m_id, u_id, parent, name,mobile,area,state_key, state_name,status, img_path, longitude, latitude) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id="+ m_id ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                
                name = name.replace(/'/g, "&quot;");
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET u_id='"+u_id+"', parent='"+parent+"', merchant_name='"+name+"', mobile='"+mobile+"', area='"+area+"', state_key='"+state_key+"', state_name='"+state_name+"', status='"+ status+"', img_path='"+ img_path+"', longitude='"+longitude+"', latitude='"+latitude+"' WHERE m_id='" +m_id+"'";
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (m_id, u_id, parent, merchant_name, mobile,area,state_key, state_name,status, img_path,longitude,latitude) VALUES ('"+m_id+"','"+u_id+"','"+parent+"','"+name+"','"+mobile+"','"+area+"', '"+state_key+"', '"+state_name+"', '"+status+"','"+img_path+"', '"+longitude+"', '"+latitude+"')" ;
				}
           
	            db.execute(sql_query);
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
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (m_id, u_id, parent,merchant_name,mobile,area,state_key,state_name,longitude,latitude,updated,img_path,is_featured,status, address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.m_id, entry.u_id, entry.parent,mysql_real_escape_string(entry.merchant_name),entry.mobile,entry.area,entry.state_key,entry.state_name,entry.longitude,entry.latitude,entry.updated,entry.img_path,entry.is_featured,entry.status,entry.address);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET u_id=?, parent=?,merchant_name=?,mobile=?,area=?,state_key=?,state_name=?,longitude=?,latitude=?,updated=?,img_path=?,is_featured=?,status=?, address=? WHERE m_id=?";
					db.execute(sql_query, entry.u_id, entry.parent,mysql_real_escape_string(entry.merchant_name),entry.mobile,entry.area,entry.state_key,entry.state_name,entry.longitude,entry.latitude,entry.updated,entry.img_path,entry.is_featured,entry.status,entry.address, entry.m_id);
				});
				
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
		});

		return Collection;
	}
};