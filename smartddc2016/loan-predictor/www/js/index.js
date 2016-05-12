/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        var buttonQuery = document.getElementById("consultar");

        buttonQuery.addEventListener('click', this.queryMLService);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    queryMLService: function() {
        var data = {
            "Inputs": {
                "input1":
                {
                    "ColumnNames": ["Col1", "Col2", "Col3", "Col4", "Col5", "Col6", "Col7", "Col8", "Col9", "Col10", "Col11", "Col12", "Col13", "Col14", "Col15", "Col16", "Col17", "Col18", "Col19", "Col20", "Col21"],
                    "Values": [[document.getElementById("StatusExistingAccount").value,
                                document.getElementById("Duration").value,
                                document.getElementById("CreditHistory").value,
                                document.getElementById("Purpose").value,
                                document.getElementById("CreditAmount").value,
                                document.getElementById("SavingAccounts").value,
                                document.getElementById("PresentEmploymentSince").value,
                                document.getElementById("InstallmentRate").value,
                                document.getElementById("StatusAndSex").value,
                                document.getElementById("OtherDebtorsGuarantors").value,
                                document.getElementById("PresentResidentSince").value,
                                document.getElementById("Property").value,
                                document.getElementById("Age").value,
                                document.getElementById("OtherInstallments").value,
                                document.getElementById("Housing").value,
                                document.getElementById("NumberOfCredits").value,
                                document.getElementById("Job").value,
                                document.getElementById("NumberOfPeopleMantained").value,
                                document.getElementById("Telephone").value,
                                document.getElementById("ForeignWorker").value,
                                "0"
                    ], ]
                },
            },
            "GlobalParameters": {
            }
        };

        $.ajax({
            type: "POST",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + apiKey);
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: endpoint,
            data: JSON.stringify(data),
            success: function (msg) {
                var results = msg.Results.output1.value.Values[0];
                var prediction = "The risk of giving this loan is: high";
                var resultDiv = $("#prediction");
                resultDiv.removeClass();
                var scoredProb = results[22];
                if (results[21] == 1) {
                    prediction = "The risk of giving this loan is: low";
                    resultDiv.addClass("low");
                }
                else {
                    resultDiv.addClass("high");
                }
                $("#scoredprob").text("Scored Probability:" + scoredProb);
                $("#risk").text(prediction);
                resultDiv.removeClass("hidden");
                $('html, body').animate({
                    scrollTop: $(document).height() - $(window).height()
                }, 1400);
            }
        });
    }
};

var apiKey = "OkKnnpVlh3ChhoKRkeNzrQnDvttvlLc2n1NCtzFTK/mGK5EMf3lUvKvfQMlb8cZ74VepS3dxQ0yQQ66KviD6dA==";
var endpoint = "https://ussouthcentral.services.azureml.net/workspaces/86e5ded0bbfa4ff2a004406fc93e13a3/services/110f0f868ab84868a813acf3604c6e32/execute?api-version=2.0&details=true";
app.initialize();