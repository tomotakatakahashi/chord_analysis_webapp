var chordSeq = [""];
var timeline = [0];
const fileIpt = document.getElementById("fileIpt");
const audioPlayer = document.getElementById("audioPlayer");
function handleFiles(files){
    if(!files.length){
        audioPlayer.innerHTML = "<p>No audio selected.</p>";
    }else{
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = window.URL.createObjectURL(files[0]);
        audioPlayer.appendChild(audio);

        const errorMessage = document.createElement("p");
        errorMessage.innerHTML = "Your browser cannot play musics. Please use a modern browser.";
        audio.appendChild(errorMessage);
        const chordView = document.getElementById("chordView");

        chordView.innerHTML = "<p>Loading. Please wait for 30 seconds.</p>";
        $.ajax({
            url: "chord_tracker",
            type: "POST",
            dataType: "json",
            contentType: false,
            data: new FormData($("#fileForm").get(0)),
            processData: false
        }).done(
            function(res){
                chordView.innerHTML = "<p>Ready.</p>";
                chordSeq = res.chord_seq;
                timeline = res.timeline;
                audio.addEventListener("timeupdate", (event) => {
                    var chordIdx = 0;
                    while(chordIdx < chordSeq.length && timeline[chordIdx] < audio.currentTime){
                        chordIdx++;
                    }
                    chordView.innerHTML = "<p>" + chordSeq[chordIdx] + "</p>";
                });
            }
        ).fail(
            function(res){
                alert("Failed. Try again later.");
            }
        )
    }
}