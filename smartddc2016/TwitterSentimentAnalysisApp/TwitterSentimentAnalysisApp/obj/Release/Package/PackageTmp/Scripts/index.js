$(function () {
    var $currentStep = $(".step-zero"),
        initialPosition = 15;

    // Set up navigation
    $(".navigation-button").click(function () {
        var nextStepSelector = $(this).attr("data-target"),
            $nextStep = $("." + nextStepSelector);

        $currentStep.animate({ left: -$currentStep.outerWidth(true) - initialPosition });
        $nextStep.animate({ left: initialPosition }, { duration: "slow" });

        $currentStep = $nextStep;
    });

    $("#predictTweetButton").click(function () {
        var tweetToPredict = $("#predictTweet").val(),
            $result = $(".step-one .result");
        if (!!tweetToPredict) {
            $result.text("Calculating..");
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

                    // procesamiento inutil
                    resultSentiment = resultSentiment === "positive" ? "positive"
                        : resultSentiment === "negative" ? "negative" : resultSentiment;

                    $result.text("The tweet is " + resultSentiment + " (" + resultPercentage + ")");
                },
                error: function (jqXHR, exception) {
                    $result.text("ERROR " + jqXHR.status + "! " + jqXHR.responseText);
                }
            });
        } else {
            $result.text("");
        }
    });

    $("#studyTermButton").click(function () {
        var termToStudy = $("#studyTerm").val(),
            $result = $(".step-two .result"),
            $container = $('.step-two .container');

        if (!!termToStudy) {
            $result.text("Calculating...");
            $.ajax({
                url: "api/sentiment/study",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({ term: termToStudy }),
                success: function (data) {
                    var result = JSON.parse(data),
                        resultSentiments = result.Results.output1.value.Values,
                        sentimentResults = getSentimentResults(resultSentiments);

                    $result.text("Results are: " + sentimentResults.positives + " positives, "
                        + sentimentResults.negatives + " negatives and " + sentimentResults.neutral + " neutrals.");

                    $container.highcharts({
                        chart: { plotBackgroundColor: null, plotBorderWidth: null, plotShadow: false, type: 'pie' },
                        title: { text: '' },
                        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
                        plotOptions: { pie: { allowPointSelect: true, cursor: 'pointer', dataLabels: { enabled: true,  format: '<b>{point.name}</b>: {point.percentage:.1f} %' } } },
                        series: [{
                            name: "Results",
                            colorByPoint: true,
                            data: [{
                                name: "Positives",
                                y: sentimentResults.positives / (resultSentiments.length) * 100
                            }, {
                                name: "Negatives",
                                y: sentimentResults.negatives / (resultSentiments.length) * 100
                            }, {
                                name: "Neutrals",
                                y: sentimentResults.neutral / (resultSentiments.length) * 100
                            }]
                        }]
                    });
                }
            });
        } else {
            $result.text("");
        }
    });

    $("#compareTermsButton").click(function () {
        var term1 = $("#compareTerm1").val(),
            term2 = $("#compareTerm2").val(),
            term3 = $("#compareTerm3").val(),
            $result = $(".step-three .result"),
            $chartContainer = $('.step-three .container');

        $result = $(".step-three .result");
        if (!!term1 && !!term2 && term3) {
            $result.text("Calculando..");
            $.ajax({
                url: "api/sentiment/compare",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({ terms: [term1, term2, term3] }),
                success: function (data) {
                    var resultSentiments = [];

                    resultSentiments.push(JSON.parse(data[0]).Results.output1.value.Values);
                    resultSentiments.push(JSON.parse(data[1]).Results.output1.value.Values);
                    resultSentiments.push(JSON.parse(data[2]).Results.output1.value.Values);

                    var sentimentResults1 = getSentimentResults(resultSentiments[0]);
                    var sentimentResults2 = getSentimentResults(resultSentiments[1]);
                    var sentimentResults3 = getSentimentResults(resultSentiments[2]);

                    $result.html("Results are: <br/>"
                        + term1 + ": " + sentimentResults1.positives + " positives, " + sentimentResults1.negatives + " negativos y " + sentimentResults1.neutral + " neutrales.<br/>"
                        + term2 + ": " + sentimentResults2.positives + " positives, " + sentimentResults2.negatives + " negativos y " + sentimentResults2.neutral + " neutrales.<br/>"
                        + term3 + ": " + sentimentResults3.positives + " positives, " + sentimentResults3.negatives + " negativos y " + sentimentResults3.neutral + " neutrales.");

                    var popularity = [getPopularity(sentimentResults1, total), getPopularity(sentimentResults2, total), getPopularity(sentimentResults3, total)];
                    var total = popularity[0] + popularity[1] + popularity[2];

                    $chartContainer.highcharts({
                        chart: { plotBackgroundColor: null, plotBorderWidth: null, plotShadow: false, type: 'pie' },
                        title: { text: '' },
                        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
                        plotOptions: { pie: { allowPointSelect: true, cursor: 'pointer', dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f} %' } } },
                        series: [{
                            name: "Results",
                            colorByPoint: true,
                            data: [{
                                name: term1,
                                y: popularity[0] / total * 100
                            }, {
                                name: term2,
                                y: popularity[1] / total * 100
                            }, {
                                name: term3,
                                y: popularity[2] / total * 100
                            }]
                        }]
                    });
                }
            });
        } else {
            $result.text("");
        }
    });

    function getSentimentResults(resultSentiments) {
        var sentimentResults = {
            positives: 0,
            negatives: 0,
            neutral: 0
        };
        for (var i = 0; i < resultSentiments.length; i++) {
            switch (resultSentiments[i][0]) {
                case "positive": sentimentResults.positives++; break;
                case "negative": sentimentResults.negatives++; break;
                default: sentimentResults.neutral++; break;
            }
        }
        return sentimentResults;
    }

    function getPopularity(sentimentResults){
        return (sentimentResults.positives * 1.5)
            + (sentimentResults.negatives * 0.5)
            + (sentimentResults.neutral * 1);
    }
});