// Standard sync setup for simple dataset

require('fh-sync-js');

var datasetId = "myShoppingList";
var template;



$(document).ready(function () {
    console.log('document ready - compiling template')
    var source = $("#shoppinglist-template").html();
    template = Handlebars.compile(source);
    
    //provide sync init options
$fh.sync.init({
    "cloudUrl": "http://localhost:3000",
    "sync_frequency": 10,
    "do_console_log": true,
    "storage_strategy": "html5-filesystem"
});

//provide listeners for notifications.
$fh.sync.notify(function (notification) {
    var code = notification.code
    if ('sync_complete' === code) {
        //a sync loop completed successfully, list the update data
        $fh.sync.doList(datasetId,
            function (res) {
                var results=_.map(res,function(v, k){return {id:k,name:v.data.name,createdDate:v.data.createdDate}});
                console.log('NOTIFY: sync_complete - list contains ' + results.length + ' records');
                var html = template({
                    items: results
                  });
                $('#shoppinglist').html(html);
                $( ".deleteid" ).click(function() {
                    var id = $( this ).data("id");
                    console.log('will delete id: ' + id);
                    $(this).attr("disabled");
                    $fh.sync.doDelete(datasetId, id,
                        function (res) {
                            console.log('Successful result from delete:', JSON.stringify(res));
                        },
                        function (err) {
                            console.log('Error result from delete:', JSON.stringify(err));
                        });
                  });
                
            },
            function (err) {
                console.log('Error result from list:', JSON.stringify(err));
            });
    } else {
        //choose other notifications the app is interested in and provide callbacks
    }
});

//manage the data set, repeat this if the app needs to manage multiple datasets
var query_params = {}; //or something like this: {"eq": {"field1": "value"}}
var meta_data = {};
$fh.sync.manage(datasetId, {}, query_params, meta_data, function () {
    // Save data
    var data = { name: "Shoppping item1", createdDate: new Date() };
    $fh.sync.doCreate(datasetId, data,
        function (res) {
            console.log('Successful result from list:', JSON.stringify(res));
        },
        function (err) {
            console.log('Error result from list:', JSON.stringify(err));
        });
});


});
  