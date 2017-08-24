exports.definition = {
	config: {
		columns: {
		    "b_id": "INTEGER",
		    "m_id": "INTEGER",
		    "name": "TEXT",
		    "state_key": "TEXT",
		    "state": "TEXT",
		    "area": "TEXT",
		    "longitude": "TEXT",
		    "latitude" : "TEXT",
		    "mobile": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "branches"
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
			getBranchesByMerchant : function(m_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name;// + " WHERE m_id='"+ m_id+ "'" ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                //return;
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    b_id: res.fieldByName('b_id'),
					    m_id: res.fieldByName('m_id'),
					    name: res.fieldByName('name'),
					    state_key: res.fieldByName('state_key'),
					    state: res.fieldByName('state'),
					    area: res.fieldByName('area'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					    mobile: res.fieldByName('mobile')
					};
					res.next();
					count++;
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getBranchById : function(b_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE b_id='"+ b_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
             	if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					     b_id: res.fieldByName('b_id'),
					    m_id: res.fieldByName('m_id'),
					    name: res.fieldByName('name'),
					    state_key: res.fieldByName('state_key'),
					    state: res.fieldByName('state'),
					    area: res.fieldByName('area'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					    mobile: res.fieldByName('mobile')
					};
					
				}
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
            saveBranches : function(b_id, m_id,name,mobile,area,state_key,  state,longitude, latitude) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE b_id="+ b_id ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET name='"+name+"', m_id='"+m_id+"', mobile='"+mobile+"', area='"+area+"', state_key='"+state_key+"', state='"+state+"', longitude='"+longitude+"', latitude='"+latitude+"' WHERE b_id='" +b_id+"'";
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (b_id, m_id, name, mobile,area,state_key, state,longitude,latitude ) VALUES ('"+b_id+"','"+m_id+"','"+name+"','"+mobile+"','"+area+"', '"+state_key+"', '"+state+"', '"+longitude+"', '"+latitude+"')" ;
				}
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            }
		});

		return Collection;
	}
};