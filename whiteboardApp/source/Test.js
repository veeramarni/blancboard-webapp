    enyo.kind({
        name: "blanc.Test",
        style: "text-align: center;",
        components: [{
            kind: "enyo.Button",
            content: "Basic Popup",
            ontap: "showPopup"
        }, {
            name: "basicPopup",
            kind: "blanc.NewItemDialog",
            floating: true,
            centered: true,
            style: "background-color: yellow; padding: 10px",
            onHide: "popupHidden",
            components: [{
                content: "Popup..."
            }]
        }],
        showPopup: function(inSender, inEvent) {
            this.$.basicPopup.show();
        },
        popupHidden: function(inSender, inEvent) {
            // do something
        }
    });