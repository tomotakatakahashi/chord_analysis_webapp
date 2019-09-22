let chordSeq = [""];
let timeline = [0];
const audioFileObjectURLs = []; // URLs to revoke


function sampleOnClick(){
    const sampleAudioURL = "static/sample-pachelbel.mp3";
    const sampleChordSeq = ["GM7", "G", "G", "G", "G", "D", "D", "D", "G", "G", "G", "G", "A7", "A", "A", "A", "D", "D", "D", "D", "DM7", "A", "A", "A", "B", "B", "B", "Bm", "Bm", "D", "D", "F#m", "G", "G", "G", "G", "G", "D", "D", "D", "G", "G", "G", "G", "A7", "A", "A", "A", "D", "D", "D", "D", "DM7", "A", "A", "A", "Bm7", "B", "Bm", "Bm", "Bm", "D", "D", "F#m", "GM7", "G", "G", "G", "D", "D", "D", "D", "G", "G", "G", "G", "A7", "A", "A", "A", "D", "D", "D", "D", "A"];
    const sampleTimeLine = [0, 0.3947392290249433, 0.8126984126984127, 1.230657596371882, 1.6718367346938776, 2.1130158730158732, 2.5541950113378684, 2.972154195011338, 3.3901133786848074, 3.8080725623582765, 4.249251700680272, 4.713650793650793, 5.178049886621316, 5.61922902494331, 6.013968253968254, 6.408707482993197, 6.8034467120181406, 7.198185941043084, 7.616145124716553, 8.010884353741497, 8.452063492063493, 8.846802721088435, 9.241541950113378, 9.659501133786849, 10.12390022675737, 10.541859410430838, 10.95981859410431, 11.377777777777778, 11.795736961451247, 12.19047619047619, 12.60843537414966, 12.979954648526077, 13.397913832199546, 13.79265306122449, 14.164172335600908, 14.489251700680272, 14.86077097505669, 15.255510204081633, 15.650249433106575, 16.091428571428573, 16.555827664399093, 16.950566893424035, 17.345306122448978, 17.786485260770974, 18.204444444444444, 18.622403628117915, 19.086802721088436, 19.52798185941043, 20.038820861678005, 20.503219954648525, 20.897959183673468, 21.31591836734694, 21.71065759637188, 22.128616780045352, 22.523356009070294, 22.941315192743765, 23.336054421768708, 23.754013605442175, 24.14875283446712, 24.589931972789117, 25.007891156462584, 25.425850340136055, 25.843809523809522, 26.261768707482993, 26.679727891156464, 27.074467120181406, 27.515646258503402, 27.910385487528345, 28.328344671201815, 28.746303854875283, 29.141043083900225, 29.53578231292517, 29.95374149659864, 30.34848072562358, 30.743219954648527, 31.161179138321994, 31.579138321995465, 31.997097505668933, 32.43827664399093, 32.879455782312924, 33.274195011337866, 33.69215419501134, 34.11011337868481, 34.5512925170068, 34.969251700680275];

    refreshAudioPlayerBlock(sampleAudioURL);
    refreshAnalysisResultView(sampleChordSeq, sampleTimeLine);
}



function refreshAudioPlayerBlock(audioFileURL){
    const audioPlayerBlock = document.getElementById("audioPlayerBlock");

    audioPlayerBlock.innerHTML = "";
    audioFileObjectURLs.forEach(function(elem){
        URL.revokeObjectURL(elem);
    });
    audioFileObjectURLs.length = 0;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.id = "audio";
    audio.src = audioFileURL;
    audioPlayerBlock.appendChild(audio);

    const errorMessage = document.createElement("p");
    errorMessage.innerHTML = "Your browser cannot play music. Please use a modern browser.";
    audio.appendChild(errorMessage);
}

function refreshAnalysisResultView(cSeq, tLine){
    [chordSeq, timeline] = compressSeqs(cSeq, tLine);

    const analysisResultView = document.getElementById("analysisResultView");
    analysisResultView.innerHTML = "";

    const downloadArea = document.createElement("div");
    const downloadLink = document.createElement("a");
    analysisResultView.appendChild(downloadArea);
    downloadArea.appendChild(downloadLink);
    downloadLink.innerHTML = "Download as CSV"
    const csvText = timeline.map((time, idx) => [time, chordSeq[idx]].join()).join("\r\n")
    // downloadLink.href = "data:text/csv;charset=UTF-8," + encodeURIComponent(csvText);
    // The above line does not work for Microsoft Edge
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4282810/
    const csvBlob = new Blob([csvText], {type: "text/csv"});
    const csvFileURL = URL.createObjectURL(csvBlob);
    downloadLink.href = csvFileURL;
    downloadLink.download = "chord_progression.csv";

    const chordView = document.createElement("div");
    analysisResultView.appendChild(chordView);
    for(let i = 0; i < chordSeq.length; i++){
        if(i){
            //for wrapping
            const space = document.createTextNode(" ");
            chordView.appendChild(space);
        }

        const chord = document.createElement("span");
        chord.id = "chord_" + i.toString();
        chord.innerHTML = chordSeq[i];
        chord.style.margin = "1em";
        chordView.appendChild(chord);
    }

    const audio = document.getElementById("audio");
    audio.addEventListener("timeupdate", function(event){
        // timeline[chordIdx] <= this.currentTime < timeline[chordIdx + 1]
        let chordIdx = lowerBound(timeline, 0, chordSeq.length, this.currentTime);
        if(chordIdx == chordSeq.length || timeline[chordIdx] != this.currentTime){
            chordIdx--;
        }

        for(let i = 0; i < chordView.children.length; i++){
            chordView.children[i].style.backgroundColor = null;
        }
        const chord = document.getElementById("chord_" + chordIdx.toString());
        chord.style.backgroundColor = "#ADD8E6";
    });
}

function fileIptOnChange(files){
    if(files.length){
        const audioFileObjectURL = URL.createObjectURL(files[0]);
        refreshAudioPlayerBlock(audioFileObjectURL);
        audioFileObjectURLs.push(audioFileObjectURL);

        const formData = new FormData();
        formData.set("fileIpt", files[0]);

        const audio = document.getElementById("audio");
        const analysisResultView = document.getElementById("analysisResultView");
        analysisResultView.innerHTML = "<p>Loading. Please wait for 30 seconds.</p>";
        $.ajax({
            url: "chord_tracker",
            type: "POST",
            dataType: "json",
            contentType: false,
            data: formData,
            processData: false
        }).done(
            function(res){
                refreshAnalysisResultView(res.chord_seq, res.timeline);
            }
        ).fail(
            function(res){
                alert("Failed. Try again later.");
            }
        )
    }
}



function lowerBound(array, beginIdx, endIdx, x){
    // binary search.
    // cf. https://cpprefjp.github.io/reference/algorithm/lower_bound.html
    if(endIdx - beginIdx == 0){
        return beginIdx
    }
    const midIdx = Math.floor((beginIdx + endIdx) / 2);
    if(array[midIdx] < x){
        return lowerBound(array, midIdx + 1, endIdx, x);
    }else{
        return lowerBound(array, beginIdx, midIdx, x);
    }
}


function compressSeqs(chordSeq, timeline){
    const retChordSeq = [], retTimeline = [];
    let idx = 0;
    while(idx < chordSeq.length){
        retChordSeq.push(chordSeq[idx]);
        retTimeline.push(timeline[idx]);

        const chordNow = chordSeq[idx];
        idx++;
        while(idx < chordSeq.length && chordSeq[idx] == chordNow){
            idx++;
        }
    }
    return [retChordSeq, retTimeline];
}

function tests(){
    console.assert(lowerBound([3, 5, 5, 6, 7, 7, 8], 0, 7, 5) == 1);
    console.assert(lowerBound([3, 5, 5, 6, 7, 7, 8], 0, 7, 4) == 1);
    console.assert(lowerBound([3, 5, 5, 6, 7, 7, 8], 0, 7, 7) == 4);
    console.assert(lowerBound([100], 0, 1, 300) == 1);

    function compareArrays(arr1, arr2){
        return arr1.every(
            (value, index) =>
                value.every(
                    (val, idx) =>
                        val == arr2[index][idx]
                )
        )
    }
    console.assert(compareArrays([["a", "b"], [5, 6]], [["a", "b"], [5, 6]]));
    console.assert(!compareArrays([["a", "a"], [5, 6]], [["a", "b"], [5, 6]]));
    console.assert(
        compareArrays(
            compressSeqs(["a", "b", "c"], [5, 6, 7]),
            [["a", "b", "c"], [5, 6, 7]]
        )
    );
    console.assert(
        compareArrays(
            compressSeqs(["a", "a", "a"], [5, 6, 7]),
            [["a"], [5]]
        )
    );
    console.assert(
        compareArrays(
            compressSeqs(["a", "a", "b", "b"], [5, 6, 7, 8]),
            [["a", "b"], [5, 7]]
        )
    );
    console.log("Tests done");
}
