(function () {
    /// handlebars ///
    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll(
        'script[type="text/x-handlebars-template"]'
    );

    Array.prototype.slice.call(templates).forEach(function (script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });
    /// handlebars ///

    var nextUrl;

    infiniteCheck();

    function runAjax() {
        var userInput = $("input").val();
        var selection = $("select").val();

        $.ajax({
            url: "https://spicedify.herokuapp.com/spotify",
            method: "GET",
            data: {
                query: userInput,
                type: selection,
            },
            success: function (data) {
                $(".resultsarea").empty();

                if (data.albums) {
                    data = data.albums;
                } else {
                    data = data.artists;
                }

                if (data.items.length == 0) {
                    $(".resulttext").html("<h3>No results :(</h3");
                    return;
                }
                $("body").css({
                    overflow: "visible",
                });
                $(".resulttext").html(
                    "<h3>Results for '" + userInput + "'</h3"
                );

                $(".resultsarea").html(
                    Handlebars.templates.resultsareaid(data)
                );

                if (data.next != null) {
                    nextUrl =
                        data.next &&
                        data.next.replace(
                            "https://api.spotify.com/v1/search",
                            "https://spicedify.herokuapp.com/spotify"
                        );
                    $(".more").css({
                        visibility: "visible",
                    });
                }
            },
        });
    }

    $("#submitbutton").on("click", runAjax);
    $(document).on("keydown", function (e) {
        if (e.which == 13) {
            runAjax();
        }
    });

    $(".more").on("click", function () {
        $.ajax({
            url: nextUrl,
            method: "GET",
            success: function (data) {
                if (data.albums) {
                    data = data.albums;
                } else {
                    data = data.artists;
                }

                $(".resultsarea").append(
                    Handlebars.templates.resultsareaid(data)
                );

                if (data.next != null) {
                    nextUrl =
                        data.next &&
                        data.next.replace(
                            "https://api.spotify.com/v1/search",
                            "https://spicedify.herokuapp.com/spotify"
                        );
                    $(".more").css({
                        visibility: "visible",
                    });
                } else {
                    $(".more").css({
                        visibility: "hidden",
                    });
                }
            },
        });
    });

    // for infinite scroll

    function infiniteCheck() {
        if (location.search.indexOf("scroll=infinite") > 0) {
            var reachedBottom = false;
            if ($("input").val() == "") {
                setTimeout(infiniteCheck, 1000);
                return;
            }
            if (
                $(window).height() + $(window).scrollTop() ==
                $(document).height()
            ) {
                reachedBottom = true;
            }
            if (reachedBottom == true) {
                $.ajax({
                    url: nextUrl,
                    method: "GET",
                    success: function (data) {
                        if (data.albums) {
                            data = data.albums;
                        } else {
                            data = data.artists;
                        }

                        $(".resultsarea").append(
                            Handlebars.templates.resultsareaid(data)
                        );

                        if (data.next != null) {
                            console.log("more results");
                            nextUrl =
                                data.next &&
                                data.next.replace(
                                    "https://api.spotify.com/v1/search",
                                    "https://spicedify.herokuapp.com/spotify"
                                );
                        }
                    },
                });
            }
            $(".more").css({
                visibility: "hidden",
            });

            setTimeout(infiniteCheck, 1000);
        }
    }
})();
