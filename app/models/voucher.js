exports.definition = {
	config: {
		columns: {
		    "v_id": "INTEGER PRIMARY KEY",
		    "item_id": "INTERGER",
		    "m_id": "INTEGER",
		    "discount": "TEXT",
		    "barcode": "TEXT",
		    "description": "TEXT",
		    "title": "TEXT",
		    "image": "TEXT",
		    "save_from": "TEXT",
		    "save_to": "TEXT",
		    "use_from": "TEXT",
		    "use_to" : "TEXT",
		    "tnc": "TEXT",
		    "redeem":"TEXT",
		    "v_limit":"TEXT",
		    "point":"INTEGER",
		    "quantity" : "INTEGER",
		    "created" : "TEXT",
		    "updated": "TEXT",
		    "status" : "INTEGER",
		    "total": "INTEGER",
		    "display_type": "TEXT",
		    "left": "INTEGER",
		    "position": "INTEGER",
		    "thumb_image": "TEXT",
		    "a_id": "INTEGER"
		},
		adapter: {
			type: "sql",
			collection_name: "voucher",
			idAttribute: "v_id"
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
				var sql_limit = (unlimit)?"":"limit 0,6";
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where status = 1;";
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
					    limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left'),
					    thumb_image: res.fieldByName('thumb_image')
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
				var sql = "select * from "+collection.config.adapter.collection_name+" where v_id="+id+";";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    discount: res.fieldByName('discount'),
					    barcode: res.fieldByName('barcode'),
					   	item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),
					    description: res.fieldByName('description'),
					    title: res.fieldByName('title'),
					    image: res.fieldByName("image"),
					    save_from: res.fieldByName("save_from"),
					    save_to: res.fieldByName("save_to"),
					    use_from: res.fieldByName('use_from'),
					    use_to: res.fieldByName('use_to'),
					    tnc: res.fieldByName('tnc'),
					    redeem: res.fieldByName('redeem'),
					    limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left'),
					    thumb_image: res.fieldByName('thumb_image')
					};                	
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;				
			},
			getDataByI_id:function(id){
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where item_id="+id+";";
				db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
				}
                var res = db.execute(sql);
                var arr;
                if(res.isValidRow()){
	            	arr = {
	            		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    discount: res.fieldByName('discount'),
					    barcode: res.fieldByName('barcode'),
					    item_id: res.fieldByName('item_id'),
					    total: res.fieldByName('total'),					    
					    description: res.fieldByName('description'),
					    title: res.fieldByName('title'),
					    image: res.fieldByName("image"),
					    save_from: res.fieldByName("save_from"),
					    save_to: res.fieldByName("save_to"),
					    use_from: res.fieldByName('use_from'),
					    use_to: res.fieldByName('use_to'),
					    tnc: res.fieldByName('tnc'),
					    redeem: res.fieldByName('redeem'),
					    limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status'),
					    use_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left'),
					    thumb_image: res.fieldByName('thumb_image')
					};                	
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;				
			},
			getInstant: function(unlimit, offset){
				var sql_limit = (unlimit) ? "" : "limit " + offset + ", 8";
				var collection = this;
				//"SELECT * FROM voucher WHERE status = 1 AND point = 0 AND date('now') <= save_to"
				var sql = "SELECT voucher.*, ads.name, ads.a_id FROM voucher LEFT OUTER JOIN ads on voucher.a_id = ads.a_id WHERE voucher.status = 1 AND voucher.point = 0 AND date('now') <= voucher.save_to AND date('now') >= voucher.save_from AND ads.status = 1 order by ads.name,voucher.position " + sql_limit;
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
                		v_id: res.fieldByName('v_id'),
					    m_id: res.fieldByName('m_id'),
					    a_id: res.fieldByName('a_id'),
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
					    limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left'),
					    thumb_image: res.fieldByName('thumb_image'),
					    name: res.fieldByName('name')
					};
                	res.next();
					count++;
                }
                res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getGift: function(unlimit, offset) {
				var sql_limit = (unlimit) ? "" : "limit " + offset + ", 8";
				var collection = this;
				var sql = "select * from "+collection.config.adapter.collection_name+" where status = 1 AND point != 0 AND date('now') <= save_to AND date('now') >= save_from order by position " + sql_limit;
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
					    limit: res.fieldByName('v_limit'),
					    point: res.fieldByName('point'),
					    quantity: res.fieldByName('quantity'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					    status: res.fieldByName('status'),
					    display_type: res.fieldByName('display_type'),
					    left: res.fieldByName('left'),
					    thumb_image: res.fieldByName('thumb_image')
					};
                	res.next();
					count++;
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
	                var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" (v_id,m_id,item_id,total,discount,barcode,description,title,image,save_from,save_to,use_from,use_to,tnc,redeem,v_limit,point,quantity,created,updated,status,display_type,left,thumb_image,a_id,position) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.v_id, entry.m_id,entry.item_id,entry.total, entry.discount,entry.barcode,entry.description,entry.title,entry.image,entry.save_from,entry.save_to,entry.use_from,entry.use_to,entry.tnc,entry.redeem, entry.limit, entry.point, entry.quantity, entry.created, entry.updated, entry.status,entry.display_type,entry.left,entry.thumb_image,entry.a_id,entry.position);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
		});
	}
};