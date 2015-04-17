exports.definition = {
	config: {
		columns: {
		    "u_id": "INTEGER",
		    "state": "TEXT",
		    "stateName": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "userState"
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
			getUserState : function(u_id){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE u_id='"+ u_id+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var memberArr = []; 
               	var count = 0;
                while (res.isValidRow()){
					memberArr[count] = {
					    u_id: res.fieldByName('u_id'),
					    state: res.fieldByName('state'),
					    stateName: res.fieldByName('stateName')
					};
					res.next();
					count++;
				} 
                
				res.close();
                db.close();
                collection.trigger('sync');
                return memberArr;
			},
			removeState : function(u_id, state){ 
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name+" WHERE u_id='" +u_id+"' AND state='"+state+"'";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			},
			
			resetUserState : function(){
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