// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    var buttonQuery = document.getElementById("consultar");

    buttonQuery.addEventListener('click', queryMLService);

    //var apiKey = "ag0LyqSk6vWnHZqDON/ucHqww3KVIr8kQHROtoSmMKudXGoj2hZgRyNKV04OudFrB0uzezudZfRrzif8DuxmkA==";
    //API KEY SIMPLE
    var apiKey = "OkKnnpVlh3ChhoKRkeNzrQnDvttvlLc2n1NCtzFTK/mGK5EMf3lUvKvfQMlb8cZ74VepS3dxQ0yQQ66KviD6dA==";

    //var endpoint = "https://ussouthcentral.services.azureml.net/workspaces/86e5ded0bbfa4ff2a004406fc93e13a3/services/127c519b013c4f67a0d72855c55e18ca/execute?api-version=2.0&details=true";
    // ENDPOINT simple
    var endpoint = "https://ussouthcentral.services.azureml.net/workspaces/86e5ded0bbfa4ff2a004406fc93e13a3/services/110f0f868ab84868a813acf3604c6e32/execute?api-version=2.0&details=true";


    function queryMLService() {

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
                var prediction = "El riesgo de dar este prestamo es: alto";
                var resultDiv = $("#prediction");
                resultDiv.removeClass();
                var scoredProb = results[22];
                if (results[21] == 1) {
                    prediction = "El riesgo de dar este prestamo es: bajo";
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
    };

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();