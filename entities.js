
var player;
var enemyList = {};
var upgradeList = {};
var bulletList = {};
var hoopList = {};

Player = function(){
	var self = Actor('player','myId',500,500,30,5,50,70,Img.player,10,1);
	
	var super_update = self.update;
	self.update = function () {
		super_update();
		if(self.pressingMouseLeft) {
			self.performAttack();
		}
		if(self.pressingMouseRight) {
			self.performShot();
		}
	}
	self.updatePosition = function(){
		if(self.pressingRight)
			self.x += 10;
		if(self.pressingLeft)
			self.x -= 10;	
		if(self.pressingDown)
			self.y += 10;	
		if(self.pressingUp)
			self.y -= 10;	
		
		//ispositionvalid
		if(self.x < self.width/2)
			self.x = self.width/2;
		if(self.x > Img.map.width*2-self.width/2)
			self.x = Img.map.width*2 - self.width/2;
		if(self.y < self.height/2)
			self.y = self.height/2;
		if(self.y > Img.map.height*2 - self.height/2)
			self.y = Img.map.height*2 - self.height/2;
	}
	
	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;
	return self;
	
}

Entity = function(type,id,x,y,spdX,spdY,width,height,img){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		spdX:spdX,
		spdY:spdY,
		width:width,
		height:height,
		img:img,
	};
	self.update = function(){
		self.updatePosition();
		self.draw();
	}
	self.draw = function(){
		ctx.save();
		var x = self.x-self.width/2;
		var y = self.y-self.height/2;

		var x = self.x - player.x;
		var y = self.y - player.y;

		x += WIDTH/2;
		y += HEIGHT/2;
		x -= self.width/2;
		y -= self.height/2;


		ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
		ctx.restore();
	}
	self.getDistance = function(entity2){	//return distance (number)
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx*vx+vy*vy);
	}

	self.testCollision = function(entity2){	//return if colliding (true/false)
		var rect1 = {
			x:self.x-self.width/2,
			y:self.y-self.height/2,
			width:self.width,
			height:self.height,
		}
		var rect2 = {
			x:entity2.x-entity2.width/2,
			y:entity2.y-entity2.height/2,
			width:entity2.width,
			height:entity2.height,
		}
		return testCollisionRectRect(rect1,rect2);
		
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
		
		if (self.type === 'bullet') {
			if(self.x < 0 || self.x > Img.map.width*2){
				
			}
			if(self.y < 0 || self.y > Img.map.height*2){
				
			}
		} else {
			if(self.x < 0 || self.x > Img.map.width*2){
				self.spdX = -self.spdX;
			}
			if(self.y < 0 || self.y > Img.map.height*2){
				self.spdY = -self.spdY;
			}
		}
		
	}
	
	return self;
}

Actor = function(type,id,x,y,spdX,spdY,width,height,img,hp,atkSpd){
	var self = Entity(type,id,x,y,spdX,spdY,width,height,img);
	
	self.hp = hp;
	self.atkSpd = atkSpd;
	self.attackCounter = 0;
	self.aimAngle = 0;
	
	var super_update = self.update;
	self.update = function(){
		super_update();
		self.attackCounter += self.atkSpd;
	}
	
	self.performAttack = function(){
		if(self.attackCounter > 25){	//every 1 sec
			self.attackCounter = 0;
			generateBullet(self,Img.bullet);
		}
	}
	
	self.performShot = function(){
		if(self.attackCounter > 50){	//every 1 sec
			self.attackCounter = 0;
			/*
			for(var i = 0 ; i < 360; i++){
				generateBullet(self,i);
			}
			*/
			generateBullet(self,Img.shot, self.aimAngle);
		}
	}

	
	return self;
}

Enemy = function(id,x,y,spdX,spdY,width,height){
	var self = Actor('enemy',id,x,y,spdX,spdY,width,height,Img.enemy,3,1);
	enemyList[id] = self;
}

randomlyGenerateEnemy = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*Img.map.width;
	var y = Math.random()*Img.map.height;
	var height = 64;	//between 10 and 40
	var width = 64;
	var id = Math.random();
	var spdX = 5 + Math.random() * 5;
	var spdY = 5 + Math.random() * 5;
	Enemy(id,x,y,spdX,spdY,width,height);
	
}

Upgrade = function (id,x,y,spdX,spdY,width,height,category,img){
	var self = Entity('upgrade',id,x,y,spdX,spdY,64,64,img);
	
	self.category = category;
	upgradeList[id] = self;
}

randomlyGenerateUpgrade = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*Img.map.width*2;
	var y = Math.random()*Img.map.height*2;
	var height = 32;
	var width = 32;
	var id = Math.random();
	var spdX = 0;
	var spdY = 0;
	
	if(Math.random()<0.5){
		var category = 'hp';
		var img = Img.upgrade1;
	} else {
		var category = 'atkSpd';
		var img = Img.upgrade2;
	}
	
	Upgrade(id,x,y,spdX,spdY,width,height,category,img);
}

Bullet = function (id,x,y,spdX,spdY,width,height,img){
	var self = Entity('bullet',id,x,y,spdX,spdY,width,height,img);
	
	self.timer = 0;

	bulletList[id] = self;
}

generateBullet = function(actor, img, aimOverwrite){
	//Math.random() returns a number between 0 and 1
	var x = actor.x;
	var y = actor.y;
	var height = 32;
	var width = 32;
	var id = Math.random();
	
	var angle;
	if(aimOverwrite !== undefined)
		angle = aimOverwrite;
	else angle = actor.aimAngle;
	
	var spdX = Math.cos(angle/180*Math.PI)*5;
	var spdY = Math.sin(angle/180*Math.PI)*5;
	Bullet(id,x,y,spdX,spdY,width,height, img);
}

Hoop = function(id, x, y, spdX, spdY, width, height, category, img){
	var self = Entity('hoop',id,x,y,spdX, spdY,width,height,img);
	self.category = category;
	hoopList[id] = self;
}

generateHoop = function(word){
	if (word === 'right') {
		var x = 1080;
	} else if (word === 'left') {
		var x = 140;
	}
	var y = 368;
	var height = 100;
	var width = 100;
	var id = Math.random();
	var spdX = 0;
	var spdY = 0;
	var category = word;
	var img = Img.hoop;
	
	Hoop(id,x,y,spdX,spdY,width,height,category,img);
}