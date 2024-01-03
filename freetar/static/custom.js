scroll_timeout = 500;
do_scroll = true;

function colorize_favs() {
    // make every entry yellow if we faved it before
    favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    $("#results tr").each(function() {
        var tab_url = $(this).find(".song").find("a").attr("href");
        if (favorites[tab_url] != undefined) {
            $(this).find(".favorite").css("color", "#ffae00");
        }
    });

}

$(document).ready(function() {
/*
    $(".favorite").click(function() {
            console.log("fav was clicked");
            favorites = JSON.parse(localStorage.getItem("favorites")) || {};
            var row = $(this).closest("tr");
            var fav = new Map();

            tab_url = row.find(".song").find("a").attr("href");
            if (favorites[tab_url] != undefined) {
                delete favorites[tab_url];
                row.find(".favorite").css("color", "#000000");
            } else {

                fav["artist_name"] = row.find(".artist").text();
                fav["tab_url"] = tab_url;
                fav["song"] = row.find(".song").text();
                fav["type"] = row.find(".type").text();
                fav["rating"] = row.find(".rating").text();

                favorites[fav["tab_url"]] = fav;
               row.find(".favorite").css("color", "#ffae00");
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));
        });
*/

        colorize_favs();

        // TODO: Only if we're on a tab page
        transpose = getTranspose(window.location.pathname);
        if (transpose != 0)
            transposeChords(transpose);

        //set dark mode
        dark_mode = JSON.parse(localStorage.getItem("dark_mode")) || false;
        if (dark_mode) {
            document.documentElement.setAttribute('data-bs-theme','dark')
        }
});

function getTranspose(tabUrl)
{
    transposes = JSON.parse(localStorage.getItem("transposes")) || {};

    if (tabUrl in transposes) {
        semitones = transposes[tabUrl]["semitones"]
    } else {
        semitones = 0;
    }

    return semitones;
}

function setTranspose(tabUrl, semitones)
{
    if (semitones === 0) {
        delete transposes[tabUrl];
    } else {
        var transpose = new Map();
        transpose["semitones"] = semitones;

        transposes[tabUrl] = transpose;
    }

    localStorage.setItem("transposes", JSON.stringify(transposes));
}

function transposeChords(semitones)
{
    $('.chord-root, .chord-base').each((i, elem) => {
        initialRoot = elem.getAttribute('data-initial-root');
        if (initialRoot === null)
        {
            initialRoot = elem.innerHTML;
            elem.setAttribute('data-initial-root', initialRoot);
        }
        elem.innerHTML = transposeChord(initialRoot, semitones);
    });

    curTranspose = document.getElementById('current-transpose')
    if (curTranspose !== null)
        curTranspose.innerHTML = semitones;
}

// TODO: This changes everything to flat, even if it wouldn't make sense
function transposeChord(chord, semitones, useFlats = true)
{
    if (semitones === 0)
        return chord;

    flattedRoots = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
    sharpedRoots = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];


    index = flattedRoots.indexOf(chord);
    if (index === -1)
        index = sharpedRoots.indexOf(chord);

    if (index === -1)
    {
        console.warn("Unable to transpose chord root: " + chord);
        return chord;
    }

    newIndex = (index + semitones) % 12
    if (newIndex < 0)
        newIndex += 12;

    roots = useFlats ? flattedRoots : sharpedRoots;

    return roots[newIndex];
}


function pageScroll() {
    console.log(scroll_timeout);
    window.scrollBy(0, 3);
    if (do_scroll) {
        scrolldelay = setTimeout(pageScroll, scroll_timeout);
    }
}

$('#checkbox_autoscroll').click(function(){
if($(this).is(':checked')){
    do_scroll = true;
    pageScroll();
} else {
    scroll_timeout = 500;
    do_scroll = false;
}
});

$('#checkbox_view_chords').click(function(){
    if($(this).is(':checked')){
        $("#chordVisuals").toggle();
    } else {
        $("#chordVisuals").toggle();
    }
});

$('#dark_mode').click(function(){
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme','light');
        localStorage.setItem("dark_mode", false);
    }
    else {
        document.documentElement.setAttribute('data-bs-theme','dark');
        localStorage.setItem("dark_mode", true);
    }
});

$('#transpose-down').click(function(){
    tabUrl = window.location.pathname;

    semitones = getTranspose(tabUrl);
    semitones--;
    setTranspose(tabUrl, semitones);

    transposeChords(semitones);
});

$('#transpose-up').click(function(){

    tabUrl = window.location.pathname;
    semitones = getTranspose(tabUrl);
    semitones++;
    setTranspose(tabUrl, semitones);

    transposeChords(semitones);
});
