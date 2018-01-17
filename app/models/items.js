exports.definition = {
	config: {
		columns: {
		    "i_id": "INTEGER PRIMARY KEY",
		    "a_id": "INTEGER",
		    "price": "TEXT",
		    "barcode":  "INTEGER",
		    "description": "TEXT",
		    "voucher_description": "TEXT",
		    "caption": "TEXT",
		    "img_path": "TEXT",
		    "position": "INTEGER",
		    "status": "INTEGER",
		    "isExclusive": "INTEGER",		//1-exclusive, 2- normal
		    "img_thumb": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "items",
			idAttribute: "i_id"
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
			getExclusiveByAid: function(a_id){
				var collection = this;
				var sql = "SELECT count(*) as total FROM " + collection.config.adapter.collection_name + " WHERE isExclusive = 1 AND a_id='"+ a_id+ "' group by a_id";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var total = 0;
                if (res.isValidRow()){
                 	total = res.fieldByName('total');
				} 
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return total;
			},
			getImageByI_id : function(i_id){
				var collection = this;
				var sql = "SELECT img_thumb FROM " + collection.config.adapter.collection_name + " WHERE i_id="+ i_id;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr; 
                if(res.isValidRow()){
                	arr= res.fieldByName("img_thumb");
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},			
			getItemByAds : function(a_id){
				var collection = this;
				var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE a_id='"+ a_id+ "' AND status = 1 order by position " ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
                 	var caption = res.fieldByName('caption');
                 	if(caption != "" && caption != null){
                 		caption = caption.replace(/&quot;/g,"'");
                 	} 
					arr[count] = {
						i_id: res.fieldByName('i_id'),
					    a_id: res.fieldByName('a_id'),
					    price: res.fieldByName('price'),
					    barcode: res.fieldByName('barcode'),
					    description: res.fieldByName("description"),
					    voucher_description: res.fieldByName("voucher_description"),
					    caption: caption,
					    isExclusive: res.fieldByName("isExclusive"),
					    img_path: res.fieldByName('img_path'),
					    img_thumb: res.fieldByName('img_thumb')
					};
					res.next();
					count++;
				} 
				 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},			
			// saveItem : function(i_id,a_id,price,barcode, caption, img_path){
// 				
				// var collection = this;
                // var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE i_id="+ i_id ;
                // var sql_query =  "";
                // db = Ti.Database.open(collection.config.adapter.db_name);
                // if(Ti.Platform.osname != "android"){
                	// db.file.setRemoteBackup(false);
				// }
                // var res = db.execute(sql);  
                // if(caption === null){
                	// caption = "";
                // }
//                 
                // if(caption != ""){
                	// caption = caption.replace(/["']/g, "&quot;");
                // }
// 				
                // if (res.isValidRow()){
             		// sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET a_id=?, price=?,barcode=?, caption=?, img_path=? WHERE i_id=?";
             		// db.execute(sql_query, a_id, price,barcode, caption, img_path, i_id);
                // }else{
                	// sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (i_id,a_id,price,barcode,caption, img_path) VALUES (?,?,?,?,?,?)" ;
                	// db.execute(sql_query, i_id, a_id, price,barcode, caption, img_path);
				// }
// 				
	            // db.close();
	            // collection.trigger('sync');
			// },
           saveArray:function(arr){
		    var collection = this;
		    var columns = collection.config.columns;
		    var names = [];
		    for (var k in columns) {
		                 names.push(k);
		             }
		                db = Ti.Database.open(collection.config.adapter.db_name);
		                if(Ti.Platform.osname != "android"){
		                 db.file.setRemoteBackup(false);
		                }
		                db.execute("BEGIN");
		                arr.forEach(function(entry) {
		                 var keys = [];
		                 var questionmark = [];
		                 var eval_values = [];
		                 var update_questionmark = [];
		                 var update_value = [];
		                 for(var k in entry){
		                  if (entry.hasOwnProperty(k)){
		                   _.find(names, function(name){
		                    if(name == k){
		                     keys.push(k);
		                     questionmark.push("?");
		                     eval_values.push("entry."+k);
		                     update_questionmark.push(k+"=?");
		                    }
		                   });
		                  }
		                 }
		                 var without_pk_list = _.rest(update_questionmark);
		                 var without_pk_value = _.rest(eval_values);
		                 var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" ("+keys.join()+") VALUES ("+questionmark.join()+")";
		                 eval("db.execute(sql_query, "+eval_values.join()+")");
		    });
		    db.execute("COMMIT");
		    //console.log(db.getRowsAffected()+" affected row");
		             db.close();
		             collection.trigger('sync');   
		   },
			resetItem : function(a_id){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name +" WHERE a_id="+ a_id;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			},
			searchItems: function(data) {
				var sql = "select merchants.merchant_name, ads.name, items.i_id, items.a_id, items.img_path from ((merchants inner join ads on merchants.m_id = ads.m_id and ads.status = 1 and ads.sales_to >= date('now') and ads.name like '%" + data + "%') inner join items on ads.a_id = items.a_id and items.status = 1)";
				db = Ti.Database.open(this.config.adapter.db_name);
				
				if(Ti.Platform.osname != "android") {
					db.file.setRemoteBackup(false);
				}
				
				var res = db.execute(sql);
				var arr = [];
				var count = 0;
				
				while (res.isValidRow()) {
					arr[count] = {
						i_id: res.fieldByName('i_id'),
						a_id: res.fieldByName('a_id'),
						img_path: res.fieldByName('img_path'),
						name: res.fieldByName('name'),
						merchants_name: res.fieldByName('merchant_name'),
					};
					res.next();
					count++;
				}
				
				res.close();
				db.close();
				return arr;
			}
		});

		return Collection;
	}
};