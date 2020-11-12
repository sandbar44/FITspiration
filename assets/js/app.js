// OPEN BUGS
// [] weird behavior when repeating search

// READY DOCUMENT
$(document).ready(function () {

    // GLOBAL VARIABLES
    // ==================================================
    var searchTerms = ['core', 'metcon', 'barre', 'yoga'];
    var approvedChannels = [
        // HIIT / CORE
        'UCqjwF8rxRsotnojGl4gM0Zw' // THENX
        , 'UCaBqRxHEMomgFU-AkSfodCw' // Chris Heria
        , 'UCERm5yFZ1SptUEU4wZ2vJvw' // Jeremy Ethier
        , 'UCe0TLA0EsQbE-MjuHXevj2A' // ATHLEAN-X
        // METCON
        , 'UCzG8mjsSZCl2v5dUFy-kGsg' // Jump Rope Fit
        , 'UCEtMRF1ywKMc4sf3EXYyDzw' // ScottHermanFitness
        , 'UCrzICdOsXhtn4zMlk4bnTIg' // Funk Roberts
        // BARRE
        , 'UCBINFWq52ShSgUFEoynfSwg' // POPSUGAR Fitness
        , 'UCpy8VXKDK6Kfp9evUI' // Coach Kel
        , 'UCIiI9tAbgvSPPL_50gefFtw' // nourishmovelove
        // YOGA
        , 'UCFKE7WVJfvaHW5q283SxchA' // Yoga With Adriene 
    ];
    var maxResults = 9;

    var quote = '';
    var author = '';
    var query = [];
    var approvedIndices = [];
    var otherIndices = [];
    var workoutDiv = '';

    // FUNCTIONS
    // ==================================================

    // Create filters
    function createFilter() {
        // Get data-state of clicked button
        var state = $(this).attr("data-state");
        // If the clicked button data-state is inactive, set data-state to active
        // Update button styling to active
        // Then add to query array
        if (state === "inactive") {
            $(this).attr("data-state", "active");
            $(this).addClass("active");
            var searchTerm = $(this).attr('data-name');
            query.push(searchTerm);
            // Else set data-state to inactive
            // Remove active button styling
            // Then remove from query array, if it exists
        } else {
            $(this).attr("data-state", "inactive");
            $(this).removeClass("active");
            var searchTerm = $(this).attr('data-name');
            var removeTerm = query.findIndex(term => term === searchTerm);
            if (removeTerm > -1) {
                query.splice(removeTerm, 1)
            }
        };
        console.log(query);
    };

    // Function to display search results when button is clicked
    function displayWorkouts() {
        // Reset search results
        $('#workout-header-rec').empty();
        $('#workout-header').empty();
        $('#workout-view-rec').empty();
        $('#workout-view').empty();
        approvedIndices = [];
        otherIndices = [];

        console.log(query);

        var queryURL = 'https://www.googleapis.com/youtube/v3/search?'
            + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
            + '&part=snippet'
            + '&type=video'
            + '&maxResults=50'
            + '&topicId=/m/027x7n'
            + '&q=' + query;
        console.log(queryURL);

        // Creating an AJAX call for the specific search
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function (response) {

            console.log(response);

            // If no results, show message
            if (response.pageInfo.totalResults === 0) {
                $('#workout-view').html('<center>Sorry, no results!</center>');
            }

            // If results exist, populate search results
            else {
                
                // Fetch workout data for all results
                for (i = 0; i < response.pageInfo.resultsPerPage; i++) {
                    
                    // Identify workouts from approved channels
                    var approvedChannel = approvedChannels.findIndex(approve => approve === response.items[i].snippet.channelId)
                    if (approvedChannel > -1) {
                        approvedIndices.push(i);
                        console.log('approved ' + approvedIndices.length);
                    }
                    else {
                        otherIndices.push(i);
                        console.log('other ' + otherIndices.length);
                    };
                };
                
                // Create workout div for approved channels
                if (approvedIndices.length > 0) {
                    // Create recommended header                
                    $('#workout-header-rec').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Recommended Workouts</h2>');
                    for (j = 0; j < approvedIndices.length; j++) {
                        var i = approvedIndices[j];
                        // Create workout div
                        workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                        var title = $('<div class="item-title">').text(response.items[i].snippet.title + ' ');
                        var channel = $('<p class="small">').text('by ' + response.items[i].snippet.channelTitle);
                        var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                        var workoutItem = $('<img>').attr({
                            'src': thumbnail,
                        });
                        
                        // Append the new search results
                        var workoutLink = $('<a>').attr({
                            'href': 'https://www.youtube.com/watch?v=' + response.items[i].id.videoId,
                            'target': '_blank'
                        });
                        workoutLink.append(workoutItem, title, channel);
                        workoutDiv.append(workoutLink);
                        $('#workout-view-rec').append(workoutDiv);
                    }
                };
                
                // Display max 9 other workouts
                for (k = 0; k < maxResults; k++) {
                    // Create search results header
                    $('#workout-header').html('<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Search Results</h2>');
                    var i = otherIndices[k];
                    // Create workout div
                    workoutDiv = $('<div class="col-md-6 col-lg-4 mb-5">');
                    var title = $('<div class="item-title">').text(response.items[i].snippet.title + ' ');
                    var channel = $('<p class="small">').text('by ' + response.items[i].snippet.channelTitle);
                    var thumbnail = response.items[i].snippet.thumbnails.medium.url;
                    var workoutItem = $('<img>').attr({
                        'src': thumbnail,
                    });

                    // Append the new search results
                    var workoutLink = $('<a>').attr({
                        'href': 'https://www.youtube.com/watch?v=' + response.items[i].id.videoId,
                        'target': '_blank'
                    });
                    workoutLink.append(workoutItem, title, channel);
                    workoutDiv.append(workoutLink);
                    $('#workout-view').append(workoutDiv);
                };

                // Advanced feature: filter by tags
                // var tagURL = 'https://www.googleapis.com/youtube/v3/videos?'
                // + 'key=AIzaSyBd4PGSzxnrnGrSj1R0vz9JNcWsA-KwcFE'
                // + '&part=snippet'
                // + '&id=' + response.items[i].id.videoId;
                // console.log(tagURL)

            };

        }).fail(function (response) {
            // Empty the contents of search results
            $('#workout-view').empty();
            console.log(response);
            $('#workout-view').html('<div class="col-md-12 col-lg-12 mb-12 text-center">Error. Please try again later.</div>');

            console.log('GET failed!');
        });
    };

    // Function for displaying buttons
    function renderButtons() {

        // Deleting the buttons prior to adding new buttons
        // (this is necessary to prevent repeat buttons)
        $('#filter-btns').empty();

        // Loop through the array of topics
        for (var i = 0; i < searchTerms.length; i++) {

            // Then dynamicaly generate buttons for each topic in the array
            var a = $('<button type="btn" class="btn btn-outline-filter filter-btn">');
            // Provide the initial button text
            a.text(searchTerms[i]);
            // Add data-attributes
            a.attr('data-name', searchTerms[i]);
            a.attr('data-state', 'inactive');

            // Adding the button to the buttons div
            $('#filter-btns').append(a);
        }
    };

    // EXECUTE
    // ==================================================

    // Random Quote Generator
    fetch('https://api.quotable.io/random?tags=inspirational')
        .then(response => response.json())
        .then(data => {
            quote = data.content;
            author = data.author;
            $('#quote').text(quote);
            $('#author').text(author);
        });

    // Click event listener to all elements with a class of 'filter-btn'
    $(document).on('click', '.filter-btn', createFilter);

    // Click event listener to all elements with a class of 'filter-btn'
    $('#submit-btn').on('click', displayWorkouts);

    // Calling the renderButtons function to display the intial buttons
    renderButtons();

})


