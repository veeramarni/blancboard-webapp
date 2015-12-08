/**
 BUG when the number of chats stored more than 50 or equivalent to rowsPerPage. Need to find out a fix.
*/
enyo.kind({
	name: "blanc.Chat",
	kind: "FittableRows",
	// ...........................
	// PRIVATE PROPERTIES
	chatDb: null,
	components: [{
		name: "titlebar",
		kind: "blanc.Toolbar",
		components: [{
			name: "chat-back",
			classes: "toolbar-title",
			tag: "span",
			components: [{
				classes: "glyphicon glyphicon-chevron-left"
			}]
		}, {
			name: "name",
			content: "name",
			style: "text-align: center;",
			fit: true
		}, {
			name: "chat-avatar",
			content: "Avatar"
		}]
	}, {
		kind: "List",
		touch: true,
		fit: true,
		style: "width:100%;",
		enableSwipe: false,
		bottomUp: true,
		rowsPerPage:1000,
		onSetupItem: "setupItem",
		components: [{
			name: "chatItem",
			kind: "blanc.ChatItem",
		}]
	}, {
		name: "footbar",
		kind: "blanc.Toolbar",
		classes: "panel-footer-toolbar",
		components: [{
			name: "hintBtn",
			kind: "blanc.Button",
			tag: "span",
			components: [{
				classes: "glyphicon glyphicon-flag"
			}]
		}, {
			fit: true,
			components: [{
				style: "width:100%;",
				classes: "input-group",
				components: [{
					name: "chatInput",
					classes: "form-control enyo-searchable",
					fit: true,
					kind: "onyx.Input",
					placeholder: "Type a message",
					onkeydown: "onEnter"
				}, {
					name: "sendIcon",
					kind: "blanc.Button",
					tag: "span",
					classes: "input-group-addon",
					content: "send"
				}]
			}]
		}]
	}],
	rendered: function(){
		this.inherited(arguments);
		this.populateChats();
	},
	messageSent: function() {
		this.addRow(this.$.chatInput.getValue());
		this.reset();
	},
	onEnter: function(sender, event) {
		if (event.keyCode === 13) {
			this.messageSent();
			return true;
		}
		return false;
	},
	populateChats: function() {
		// Artificially generating data
		this.createDb(40);
		this.$.list.setCount(this.chatDb.length);
		this.$.list.reset();
		this.reset();
	},
	setupItem: function(sender, event) {
		var ind = event.index,
			ch = this.chatDb[ind];
		console.log(ind);
		this.$.chatItem.setMessage(ch.message);
		this.$.chatItem.setDate(ch.date);
		//this.$.list.scrollToStart();
		return true;
	},
	createDb: function(inCount) {
		/* global makeName */
		this.chatDb = [];
	//	var i =0;
	//	this.chatDb.push(this.generateItem(bjse.testutil.makeName(4, 6) + ' ' + bjse.testutil.makeName(5, 10)+ ' '+ i));
		for (var i = 0; i < inCount; i++) {
			this.chatDb.push(this.generateItem(bjse.testutil.makeName(4, 6) + ' ' + bjse.testutil.makeName(5, 10)+ ' '+ i));
		}
		// this.sortDb();
	},
	generateItem: function(mesg) {
		return {
			message: mesg,
			date: new Date()
		};
	},
	addChat: function(mesg){
		this.chatDb.push(this.generateItem(mesg))
	},
	addRow: function(mesg) {
		this.addChat(mesg);
		this.$.list.setCount(this.$.list.count + 1);
		this.$.list.refresh();
		this.$.list.scrollToStart();
	},
	reset: function(){
		this.$.chatInput.setValue("");
	}
});

enyo.kind({
	name: "blanc.ChatItem",
	kind: "FittableColumns",
	classes: "bubble2",	
	components: [{
		name: "message",
		fit: true,
		content: "Chat Message",

	}, {
		name: "date",
		classes: "mm-file-date",
		content: "Aug 7, 2014"
	}],
	setMessage: function(message) {
		this.$.message.setContent(message);
	},
	setDate: function(dt) {
		this.$.date.setContent(DateFormat.format.date(dt, "h:mm a"));
	}
})