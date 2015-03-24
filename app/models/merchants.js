exports.definition = {
	config: {
		columns: {
		    "m_id": "INTEGER",
		    "name": "TEXT",
		    "mobile": "TEXT",
		    "area": "TEXT",
		    "state_key": "TEXT",
		    "state": "TEXT",
		    "longitude": "TEXT",
		    "latitude" : "TEXT",
		    "state": "TEXT",
		    "img": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "merchants"
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
			getMerchantsById : function(m_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id='"+ m_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                //	return;
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    name: res.fieldByName('name'),
					    mobile: res.fieldByName('mobile'),
					    area: res.fieldByName('area'),
					    state_key: res.fieldByName('state_key'),
					    state: res.fieldByName('state'),
					    img: res.fieldByName('img'),
					    longitude: res.fieldByName('longitude'),
					    latitude: res.fieldByName('latitude'),
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
            saveMerchants : function(m_id,name,mobile,area,state_key,  state, img, longitude, latitude) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE m_id="+ m_id ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                db.file.setRemoteBackup(false);
                var res = db.execute(sql);
                
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET name='"+name+"', mobile='"+mobile+"', area='"+area+"', state_key='"+state_key+"', state='"+state+"', img='"+ img+"', longitude='"+longitude+"', latitude='"+latitude+"' WHERE m_id='" +m_id+"'";
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (m_id, name, mobile,area,state_key, state, img,longitude,latitude) VALUES ('"+m_id+"','"+name+"','"+mobile+"','"+area+"', '"+state_key+"', '"+state+"', '"+img+"', '"+longitude+"', '"+latitude+"')" ;
				}
           
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            }
		});

		return Collection;
	}
};