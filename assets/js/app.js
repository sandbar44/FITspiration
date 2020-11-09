// READY DOCUMENT
$(document).ready(function () {

    // GLOBAL VARIABLES
    // ==================================================
    var searchTerms = ['core finisher', 'metcon', 'barre', 'yoga'];

    // EXECUTE
    // ==================================================

    // Function to display search results when button is clicked
    function displayWorkouts() {
        var searchTerm = $(this).attr("data-name");
        var queryURL = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE&part=snippet&maxResults=3&q=" + searchTerm;

        // Creating an AJAX call for the specific search
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // Empty the contents of search results
            $("#workout-view").empty();

            // Call function to fetch workouts
            for (i = 0; i < 10; i++) {
                var workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                var title = $('<div class="item-title">').text(response.items[i].snippet.title + " ");
                var channel = $('<p class="small">').text("by " + response.items[i].snippet.channelTitle);
                var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                var workoutItem = $("<img>").attr({
                    "src": thumbnail,
                });
                
                // Append the new search results
                var workoutLink = $("<a>").attr({
                    "href" : "https://www.youtube.com/watch?v=" + response.items[i].id.videoId,
                    "target" : "_blank"
                });
                workoutLink.append(workoutItem, title, channel);
                workoutDiv.append(workoutLink);
                $("#workout-view").append(workoutDiv);

            }
        })

    };

    // Function for displaying buttons
    function renderButtons() {

        // Deleting the buttons prior to adding new buttons
        // (this is necessary to prevent repeat buttons)
        $("#filter-btns").empty();

        // Loop through the array of topics
        for (var i = 0; i < searchTerms.length; i++) {

            // Then dynamicaly generate buttons for each topic in the array
            var a = $('<button type="btn" class="btn btn-outline-filter filter-btn">');
            // Providing the initial button text
            a.text(searchTerms[i]);
            // Adding a data-attribute
            a.attr("data-name", searchTerms[i]);

            // Adding the button to the buttons div
            $("#filter-btns").append(a);
        }
    };

    // Function for handling events where a gif is clicked
    function clickGifs() {
        // Get data-state of clicked gif
        var state = $(this).attr("data-state");
        // If the clicked image's state is still, update its src attribute to what its data-animate value is.
        // Then, set the image's data-state to animate
        // Else set src to the data-still value
        if (state === "still") {
            $(this).attr("src", $(this).attr("data-animate"));
            $(this).attr("data-state", "animate");
        } else {
            $(this).attr("src", $(this).attr("data-still"));
            $(this).attr("data-state", "still");
        }
    };

    // Function for adding a new Gif button
    $("#add-gif").on("click", function (event) {
        event.preventDefault();

        // Grab  input from the textbox
        var gif = $("#gif-input").val().trim();

        // Adding movie from the textbox to our array
        if (gif !== "") {
            topics.push(gif);
        }

        // Calling renderButtons which handles the processing of our movie array
        renderButtons();

        $("#gif-form").trigger("reset");
    });


    // Click event listener to all elements with a class of "gif-btn"
    $(document).on("click", ".filter-btn", displayWorkouts);

    // Click event listener to all elements with a class of "gif"
    $(document).on("click", ".gif", clickGifs);

    // Calling the renderButtons function to display the intial buttons
    renderButtons();

})


