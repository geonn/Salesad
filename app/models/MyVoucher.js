exports.definition = {
	config: {
		columns: {
		    "My_vid": "INTEGER PRIMARY KEY",
		    "u_id": "TEXT",
		    "v_id": "INTEGER",
		    "quantity": "INTEGER",
		    "created" : "TEXT",
		    "updated": "TEXT",
		    "status" : "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "MyVoucher",
			idAttribute: "My_vid"
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
			getData: function(unlimit){
				var sql_limit = (unlimit)?"":" limit 0,6";
				var collection = this;
				var sql = "select voucher.*,MyVoucher.My_vid from "+collection.config.adapter.collection_name+" left outer join voucher on voucher.v_id = MyVoucher.v_id where voucher.v_id = MyVoucher.v_id";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr = [];
				var count = 0;   
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	arr[count] = {
                		My_vid: res.fieldByName('My_vid'),
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    discount: res.fieldByName('discount'),
					    barcode: res.fieldByName('barcode'),
					    description: res.fieldByName('description'),
					    title: res.fieldByName("title"),
					    image: res.fieldByName("image"),
					    save_from: res.fieldByName("save_from"),
					    save_to: res.fieldByName("save_to"),
					    use_from: res.fieldByName('use_from'),
					    use_to: res.fieldByName('use_to'),
					    tnc: res.fieldByName('tnc'),
					    redeem: res.fieldByName('redeem'),
					    v_limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status')
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getDataById:function(id){
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where My_vid="+id+" ";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		My_vid: res.fieldByName('My_vid'),
	            		v_id: res.fieldByName('v_id'),
					    u_id: res.fieldByName('u_id'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status')
					};                	
                }
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
	                var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" (My_vid,u_id,v_id,quantity,created,updated,status) VALUES (?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.id,entry.u_id,entry.v_id, entry.quantity, entry.created, entry.updated, entry.status);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
		});
	}
};