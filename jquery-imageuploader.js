/**
这是一个图片上传控件，文件上传大小限制由后台服务器设定
*/

(function(){
	function ImageUploader(options){
		var id = options.id;
		var container = options.container;
		var isMulti = options.isMulti;
		this.url = options.url || "#";
		
		var width = options.width || "450px";
		var height = options.height || "260px";
		var imageWidth = options.imageWidth || "100px";
		var imageHeight = options.imageHeight || "100px";

		this.isLocal = options.isLocal || false;
		this.getFileUrl = options.getFileUrl || function(response){
			return response;
		};
		this.preview_img = options.preview_img;

		this.parameters = options.parameters || {};
		this.onclearACard = options.onclearACard || function(){};
		this.onclearAll = options.onclearAll || function(){};
		this.onImgClick = options.onImgClick || function(){};
		this.maxCount = options.maxCount || -1;

		var width_int = width.substr(0,width.length-2);
		var height_int = height.substr(0,height.length-2);

		var outerdiv = $("<div style='overflow-y:auto;'></div>");
			outerdiv.css("width",width);
			outerdiv.css("height",height);
			outerdiv.css("background-color","white");

		var innerdiv = $("<div style='width:"+(0.9 * width_int)+"px;margin:0 auto;'></div>");
			
		var spanDiv = $("<div style='height:30px;background-color:blue;text-align:right;'><div>");
			var clearButton = $("<button>Clear</button>");
			clearButton.prop("host",this);
			clearButton.click(function(){
				var host = $(this).prop("host");
				host.clear(host.onclearAll);
			});
			spanDiv.append(clearButton);
		var newImageButtonDiv = $("<div style='float:left'></div>");
			newImageButtonDiv.css("width",imageWidth);
			newImageButtonDiv.css("height",imageHeight);
			newImageButtonDiv.css("margin","5px");

			var multiple_string =isMulti?"multiple='multiple'":"";
			console.log(multiple_string);
			var fileInput = $("<input style='width:0px;height:0px;' type='file' "+multiple_string+" accept='image/png, image/jpeg'>");
			fileInput.prop("container",innerdiv);
			fileInput.prop("host",this);
			fileInput.change(function(){
				var files = this.files;
				if(files.length == 0){
					return;
				}

				if(this.maxCount != -1 && files.length >= this.maxCount){
					alert("一次选择文件的数量不可超过"+this.maxCount+"个");
					$(this).val("");
					return;
				}

				var host = $(this).prop("host");
				for(var i = 0; i < files.length; i++){
					var card = uploadImageCard({
						width:"100px",
						height:"100px",
						url:host.url,
						file: files[i],
						host: host
					});
					var filename = card.attr("filename");
					$(this).prop("container").append(card);
				}
				$(this).val("");
			});
			var imageSpanDiv = $("<div style='height:20px;'></div>"); newImageButtonDiv.append(imageSpanDiv);
			var newImageButton = $("<div style='width:58px;height:58px;margin:0 auto;border: 1px dashed silver; border-radius: 10px; cursor: pointer;text-align: center;'><div style='height:20px;'></div>+</div>");
			newImageButton.prop("inputInstance",fileInput);
			newImageButton.click(function(){$(this).prop("inputInstance").click();});
			newImageButtonDiv.append(newImageButton);

		innerdiv.append(spanDiv);
		innerdiv.append(newImageButtonDiv);	
		outerdiv.append(innerdiv);
		container.append(outerdiv);
	}

	ImageUploader.prototype.cardSet = new Object();
	ImageUploader.prototype.clear = function(onclear){
		for(var keys in this.cardSet){
			var card = this.cardSet[keys];
			card.remove();
		}
		this.preview_img.prop("src","");
		this.preview_img.prop("fileid","");
		this.cardSet = new Object();
		onclear(this.fileList);
	}

	ImageUploader.prototype.clearACard = function(fileid, onclear){
		var card = this.cardSet[fileid];
		if(card){
			card.remove();
			delete this.cardSet[fileid];

			if(this.preview_img.prop("fileid") === fileid){
				this.preview_img.prop("src","");
				this.preview_img.prop("fileid","");
			}
		}
		onclear(fileid);
	}

	ImageUploader.prototype.getFileList = function(){
		return keys(this.cardSet);
	}
	function uploadImageCard(options){
		var width = options.width;
		var height = options.height;
		var url = options.url;
		var file = options.file;
		var host = options.host;

		//构造完全居中的包含层
		var cardDiv = $("<div style='float:left;margin:5px;text-align:center;background-color:rgba(202,113,106,0.3);'></div>");
		var table = $("<table cellSpacing=0 cellPadding = 0 style='width:100%;height:100%;margin:0;padding:0;'></table>"); 
		var tr = $("<tr style='width:100%;height:100%;margin:0;padding:0;'></tr>"); 
		var td = $("<td vAlign='middle' style='width:100%;height:100%;margin:0;padding:0;'></td>");
		tr.append(td);table.append(tr);
		cardDiv.append(table);

		//生成预览图片
		var img = $("<img style='max-width:"+width+";max-height:"+height+";margin:0;padding:0;'/>");
		img.prop("host",host);

		var fileid = Math.round(Math.random() * 900000); //生成100000-999999之间的一个整数，作为图片的唯一标识符
		img.prop("fileid",fileid);
		cardDiv.prop("fileid",fileid);

		img.click(function(){
			var host = $(this).prop("host");
			var fileid = $(this).prop("fileid");
			var preview = host.preview_img;
			if(preview){
				preview.prop("src",$(this).prop("src"));
				preview.prop("fileid",fileid);
			} 
			host.onImgClick(fileid);
		});
		if(host.isLocal){
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.imgInstance = img;
			//由于本地图片需要解码，反而加载速度会变慢
			//可以选择加载服务器端图片，但是要求定义服务器返回图像存放位置的响应
			reader.onload = function(){
				var base64 = this.result;
				this.imgInstance.prop("src",base64);
			}
		}
		

		var progressDiv = $("<div style='width:80%;height:10px;margin:0 auto;'></div>");
		progressDiv.progressbar();
		td.append(progressDiv);
		cardDiv.css('width',width); cardDiv.css('height',height);

		var fd = new FormData();
		fd.append("fileInput",file);
		fd.append("id",fileid);
		for(var key in host.parameters){
			//添加图片上传时的参数
			fd.append(key,host.parameters[key]);
		}

		var xhr = new XMLHttpRequest();
		xhr.imgInstance = img;
		xhr.upload._custome_progressbar = progressDiv;
		xhr.hostCard = cardDiv;
		xhr.fileid = fileid;
		xhr.hostUploader = host;
		xhr.upload.addEventListener("progress",function(evt){
			var per = evt.loaded / evt.total * 100;
			this._custome_progressbar.progressbar("value",per);
		},false);

		xhr.onload = function(){
			var fileid = this.fileid;
			var img = this.imgInstance;
			if(!this.hostUploader.isLocal){
				img.prop("src",this.hostUploader.getFileUrl(this.response));
			}
			
			var delete_div = $("<div style='width:20px;height:20px;background-color:silver;border-radius:10px;position:relative;left:78%;top:-98%;cursor:pointer;'>x</div>")
			delete_div.css("font-size","12px");
			delete_div.prop("fileid",fileid);
			delete_div.prop("hostUploader",this.hostUploader);
			delete_div.click(function(){
				$(this).prop("hostUploader").clearACard($(this).prop("fileid"), $(this).prop("hostUploader").onclearACard);
			});
			this.hostCard.attr("fileid",fileid);
			this.upload._custome_progressbar.replaceWith(img);
			this.hostCard.append(delete_div);
			this.hostUploader.cardSet[fileid] = this.hostCard;
		}
		xhr.open("POST",url,true);
		xhr.send(fd);
		return cardDiv;
	}
	window.ImageUploader = ImageUploader;
}());

