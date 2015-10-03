$(function () {
    var $currentStep = $(".step-zero"),
        initialPosition = 15;

    // Set up navigation
    $(".navigation-button").click(function () {
        var nextStepSelector = $(this).attr("data-target"),
            $nextStep = $("." + nextStepSelector);

        //$currentStep.css("left", -$currentStep.outerWidth(true) - initialPosition);
        //$nextStep.css("left", initialPosition);

        $currentStep.animate({ left: -$currentStep.outerWidth(true) - initialPosition });
        $nextStep.animate({ left: initialPosition }, { duration: "slow" });

        $currentStep = $nextStep;
    });

    $("#predictTweetButton").click(function () {
        var tweetToPredict = $("#predictTweet").val(),
            $result = $(".step-one .result");
        if (!!tweetToPredict) {
            $result.text("Calculando..");
            $.ajax({
                url: "api/sentiment/predict",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({ tweet: tweetToPredict }),
                success: function (data) {
                    var result = JSON.parse(data),
                        resultSentiment = result.Results.output1.value.Values[0][0],
                        resultPercentage = result.Results.output1.value.Values[0][1];

                    resultSentiment = resultSentiment === "positive" ? "positivo"
                        : resultSentiment === "negative" ? "negativo" : resultSentiment;

                    $result.text("El tweet es " + resultSentiment + " (" + resultPercentage + ")");
                },
                error: function (jqXHR, exception) {
                    $result.text("ERROR " + jqXHR.status + "! " + jqXHR.responseText)
                }
            });
        } else {
            $result.text("");
        }
    });

    $("#studyTermButton").click(function () {
        var termToStudy = $("#studyTerm").val(),
            $result = $(".step-two .result");
        if (!!termToStudy) {
            $result.text("Calculando..");

            $.ajax({
                url: "api/sentiment/study",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({ term: termToStudy }),
                success: function (data) {
                    var result = JSON.parse(data),
                        resultSentiments = result.Results.output1.value.Values,
                        positives = 0,
                        negatives = 0,
                        neutral = 0;

                    for (var i = 0; i < resultSentiments.length; i++) {
                        switch (resultSentiments[i][0]) {
                            case "positive": positives++; break;
                            case "negative": negatives++; break;
                            default: neutral++; break;
                        }
                    }

                    $result.text("El resultado arroja " + positives + " positivos, "
                        + negatives + " negativos y " + neutral + " neutrales.");

                    $('#container').highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie'
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                }
                            }
                        },
                        series: [{
                            name: "Resultados",
                            colorByPoint: true,
                            data: [{
                                name: "Positivos",
                                y: positives / (resultSentiments.length) * 100
                            }, {
                                name: "Negativos",
                                y: negatives / (resultSentiments.length) * 100
                            }, {
                                name: "Neutros",
                                y: neutral / (resultSentiments.length) * 100
                            }]
                        }]
                    });
                }
            });
        } else {
            $result.text("");
        }
    });

    //$("#compareTermsButton").click(function () {
    //    var term1 = $("#compareTerm1").val(),
    //        term2 = $("#compareTerm2").val(),
    //        $result = $(".step-three .result");
    //    if (!!term1 && !!term2) {
    //        $result.text("Calculando..");

    //        $.ajax({
    //            url: "api/sentiment/compare",
    //            type: "POST",
    //            dataType: "json",
    //            contentType: "application/json",
    //            data: JSON.stringify({ term1: term1, term2: term2 }),
    //            success: function (data) {
    //                $result.text("El resultado es " + data);
    //            }
    //        });
    //    } else {
    //        $result.text("");
    //    }
    //});
});