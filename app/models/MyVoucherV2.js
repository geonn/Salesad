exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "u_id": "TEXT",
		    "v_id": "INTEGER",
		    "quantity": "INTEGER",
		    "created" : "TEXT",
		    "updated": "TEXT",
		    "status" : "INTEGER",
		    "title": "TEXT",
		    "description": "TEXT",
		    "save_from": "TEXT",
		    "save_to": "TEXT",
		    "use_from": "TEXT",
		    "use_to": "TEXT",
		    "tnc": "TEXT",
		    "redeem": "TEXT",
		    "limit": "INTEGER",
		    "point": "INTEGER",
		    "total": "INTEGER",
		    "image": "TEXT",
		    "thumb_image": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "MyVoucherV2",
			idAttribute: "id"
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
				var sql = "select voucher.*,MyVoucher.id from "+collection.config.adapter.collection_name+" left outer join voucher on voucher.v_id = MyVoucher.v_id where voucher.v_id = MyVoucher.v_id";
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
                		id: res.fieldByName('id'),
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),					    
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
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left')
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
				var sql = "select * from "+collection.config.adapter.collection_name+" where id="+id+" ";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		id: res.fieldByName('id'),
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
			getCountLimitByVid:function(vid){
				var collection = this;
				var sql = "select count(v_id) as v_limit from "+collection.config.adapter.collection_name+" where v_id = "+vid;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		count: res.fieldByName('v_limit'),
					};                	
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;		
			},
			getCountByVid:function(vid){
				var collection = this;
				var u_id = Ti.App.Properties.getString('u_id') || 0;
				var sql = "select count(v_id) as v_limit from "+collection.config.adapter.collection_name+" where v_id = "+vid+" and status = 1 and u_id = ? ";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql, u_id);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		count: res.fieldByName('v_limit'),
					};                	
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;		
			},
			saveArray : function(arr){ // 4th version of save array
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
	            db.close();
	            collection.trigger('sync');
			},
			resetRecord : function(){
				var collection = this;
				var sql = "DELETE FROM " + collection.config.adapter.collection_name;
				db = Ti.Database.open(collection.config.adapter.db_name);
				db.execute(sql);
				db.close();
				collection.trigger('sync');
			},
			ongoingvoucher: function(unlimit){
				var u_id = Ti.App.Properties.getString('u_id') || 0;
				var sql_limit = (unlimit)?"":" limit 0,6";
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where date('now') <= use_to and status = 1 AND u_id = ?";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql, u_id);
                var arr = [];
				var count = 0;   
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	arr[count] = {
                		id: res.fieldByName('id'),
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),
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
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left')
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},getVoucherByMy_vid:function(id){
				var collection = this;
				var sql = "select voucher.*,MyVoucher.id from "+collection.config.adapter.collection_name+" left outer join voucher on voucher.v_id = MyVoucher.v_id where voucher.v_id = MyVoucher.v_id and MyVoucher.id = "+id;
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
                	arr= {
                		id: res.fieldByName('id'),
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),					    
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),					    
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
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left')
					};
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;				
			},
			expirevoucher: function(unlimit){
				var u_id = Ti.App.Properties.getString('u_id') || 0;
				var sql_limit = (unlimit)?"":" limit 0,6";
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where date('now') > use_to and status = 1 and u_id = ?";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql, u_id);
                var arr = [];
				var count = 0;   
                while (res.isValidRow()){
                	var row_count = res.fieldCount;
                	arr[count] = {
                		id: res.fieldByName('id'),
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),					    
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
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left')
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
		});
	}
};