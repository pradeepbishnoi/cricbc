$(document).ready(function(){

    var ruleStringArray = []
    var ruleCounter = 0
    var jsonData = ""
    $("#addRule").on('click',function(){
        console.log("working");
        ruleString = ""
        ruleString += "RULE_START\n";
        ruleString += $("#conditionText").val() + "\n";
        ruleString += "THEN\n";
        ruleString += $("#actionText").val() + "\n";
        ruleString += "RULE_END\n";
        console.log(ruleString);
        ruleStringArray.push(ruleString);
        // add new element to list-group
        ++ruleCounter;
        $("#ruleList").append("<a href='#' class='rule-check list-group-item' id='a-rule-"+ruleCounter+"'>Rule <span class='badge'>" + ruleCounter + "</span><span class='badge kill' id='"+ ruleCounter + "'><span class='glyphicon glyphicon-minus'></span></span></a>")
        $("#newRuleModal").modal('hide');
        $("#conditionText").val('');
        $("#actionText").val('');
    });

    $('#newRuleModal').on('shown.bs.modal', function () {
        $('#conditionText').focus();
    });

    $('#jsonDataModal').on('shown.bs.modal', function () {
        $('#jsonData').focus();
    });

    $("#addJsonData").on('click',function(){
        jsonData = $("#jsonData").val();
        console.log(jsonData);
        $("#jsonDataOutput").html(jsonData);
        $("#jsonDataModal").modal('hide');
        $("#jsonData").val();
    });

    $("#ruleList").on('click','.kill',function(){
        ruleNumber = $(this).attr('id');
        console.log("id: ",ruleNumber-1);
        $(this).parent().remove();
        ruleStringArray.splice(parseInt(ruleNumber)-1,1);
        console.log(ruleStringArray);
        --ruleCounter; 
    });

    $("#ruleList").on('click','.rule-check',function(){
        ruleNumber = $(this).attr('id');
        ruleNumber = parseInt(ruleNumber.replace("a-rule-",""));

        $('#checkRuleModal').modal('show');
        console.log("id: ",ruleNumber);
        console.log(ruleStringArray[ruleNumber-1]);
        $('#ruleText').html(ruleStringArray[ruleNumber-1]);
    });
    
    $("#solve").on('click',function(){
        $.ajax({
            type:'POST',
            url:'ruleengine',
            data: {rule_data: ruleStringArray.join("\n") , json_data : jsonData },
            cache: false
        })
        .done(function(jsonData){
            console.log(jsonData);
            
            jsonData = $.parseJSON(jsonData);
            //start creating the table
            $("#dataTable").html('');
            $("#dataTable").append("<thead><tr><th>Product Id</th><th>Actions</th></tr></thead>");
            $("#dataTable").append("<tbody>");
           for(var key in jsonData){
                trString = "<tr><td>" + key + "</td>";
                var tdString = "<td>";
                for ( var actionDataJson in jsonData[key]) {
                    var actionData = $.parseJSON(jsonData[key][actionDataJson]);
                    
                    console.log(actionData);
                    for(var i in actionData) {
                        for(var actionKey in actionData[i]) {
                            tdString += '<span class="actionSpan">' + actionKey + '<span class="badge actionBadge">' + actionData[i][actionKey] + '</span></span>';
                        }
                    }
                }

                tdString += "</td>";
                console.log(tdString);                    

                trString += tdString;
                trString += "</tr>";
                console.log(trString);
                $("#dataTable").append(trString);
            }
            $("#dataTable").append("</tbody>");
        });
        
    });

});