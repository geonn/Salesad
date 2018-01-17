exports.definition = {
	config: {
		columns: {
		    "u_id": "INTEGER",
		    "firstname": "TEXT",
		    "lastname": "TEXT",
		    "gender": "INTEGER",
		    "email": "TEXT",
		    "session": "TEXT",
		    "location": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "member"
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
			getUserBySession : function(session){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE session='"+ session+ "'" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var memberArr = []; 
               
                if (res.isValidRow()){
					memberArr = {
					    u_id: res.fieldByName('u_id'),
					    firstname: res.fieldByName('firstname'),
					    lastname: res.fieldByName('lastname'),
					    gender: res.fieldByName("gender"),
					    email: res.fieldByName('email'),
					    session: res.fieldByName('session')
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return memberArr;
			},
            updateUserSession : function(u_id,firstname,fullname,gender,email, session) {
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE u_id="+ u_id ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET session='"+session+"' WHERE u_id='" +u_id+"'";
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (u_id, username, fullname,email, session) VALUES ('"+u_id+"','"+username+"','"+fullname+"','"+email+"','"+session+"')" ;
				}
           
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            },
            updateUserProfile : function (session,fullname,email){
            	var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET fullname='"+fullname+"', email='"+email+"' WHERE session='" +session+"'";
           
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
            }
		});

		return Collection;
	}
};