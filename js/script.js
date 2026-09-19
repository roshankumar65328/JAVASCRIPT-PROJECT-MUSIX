// console.log("script is running...");
let currentSong = new Audio();
let currentFolder;
let songs;
function secondsToMinute(input) {
    if (isNaN(input) || input < 0) {
        return "00:00"
    }
    // Convert string/decimal to number
    let seconds = Math.floor(parseFloat(input));

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    // Pad with leading zeros
    let mm = String(minutes).padStart(2, "0");
    let ss = String(remainingSeconds).padStart(2, "0");

    return `${mm}:${ss}`;
}

// getdata song name nikal rha h, show songs on playlist, if click son song play, return songs
async function getdata(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)      //fetch(`http://127.0.0.1:3000/songs/Bhajan/`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    // console.log(as)
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            // songs.push(element.href.split(`/${folder}/`)[1])
            songs.push(element.innerHTML)
            // console.log(songs);
            
        }
    }

    // show all songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `

                        <li class="box">
                        <div class="song-details">
                            <i class="fa-solid fa-music"></i>
                            <p>${song.replaceAll("%20", " ")}</p>
                        </div>
                        <!--<div class="play-now">
                            <p>play now</p>
                            <img class="invert" src="img/play.svg">
                        </div>-->
                    </li>`
    }

    // if click on songlist > li then play the song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".song-details").children[1].innerHTML)
            playMusic(e.querySelector(".song-details").children[1].innerHTML.trim())
        })

    })
    // console.log(songs);
    
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

// display the album on right portion on desktop
async function displayAlbum() {
    // get the simple folder name
    let a = await fetch(`songs`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardCont = document.querySelector(".card-container")
    // console.log(anchors)
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs")) {
            // console.log(e); 
            // console.log(e.href.split("/").slice(-2)[0]);
            // console.log(e.href.split("%5C"));
            
            folder = e.href.split("%5C")[2].split("/")[0]
            // console.log(folder);
            
            
            // Get the meta data of the folder  
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardCont.innerHTML = cardCont.innerHTML + `

                    <div data-folder="${folder}" class="card">
                         <img src="songs/${folder}/cover.jpg" alt="">
                         <h2>${response.title}</h2>
                         <p>${response.description}</p>
                    </div>`
        }

    }

    // load the playlist when card clicked & play 1st song
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // songs = await getdata(`songs/${item.dataset.folder}`)
            //console.log(item.target);     // target.dataset karenge to card me specific element ko lega aur usse data-folder="" nahi milega
            // console.log(item.currentTarget.dataset);    // so use currentTarget.dataset.folder to indicate the specific folder
            songs = await getdata(`songs/${item.currentTarget.dataset.folder}`)
            console.log(songs);
            
            playMusic(songs[0])
        })
    })

}


async function main() {

    // get the list of all the songs
    await getdata("songs/Bhajan");
    // console.log(songs);
    playMusic(songs[0],true);

    //display all the playlist on the page
    await displayAlbum()

    // attach an event listener to play, next and previous 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinute(currentSong.currentTime)} / ${secondsToMinute(currentSong.duration)}`
        document.querySelector(".seek-circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // when click on seekbar change the seekbar, also song currentTime
    document.querySelector(".seekbar").addEventListener("click", e => {
        var circlePercent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seek-circle").style.left = circlePercent + "%"
        currentSong.currentTime = ((currentSong.duration) * circlePercent) / 100
    })

    // add event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        // console.log("previous clicked")
        // console.log(songs);
        
        let src = decodeURI(currentSong.src.split("/")[5])
        let index = songs.indexOf(`${src}`);
        
        // console.log(songs.indexOf(currentSong.src));
        
        // let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // let currentFile = encodeURI(currentSong.src.split("/").slice(-1)[0]);
        // let index = songs.indexOf(currentFile);

        // console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else if ((index - 1) === -1) {
            playMusic(songs[songs.length-1])
        }

    })

    // add event listener to next
    next.addEventListener("click", () => {
        // console.log("next clicked")
        // console.log(songs);
        // console.log(songs.length);
        
        let calcSrc = decodeURI(currentSong.src);
        let src = calcSrc.split("/")[5]
        let index = songs.indexOf(`${src}`);
         
        // console.log(actualIndex);
        // console.log(indexNew);
        // console.log(songs[0]);
        // console.log(songs.indexOf("High Heels.mp3"));
        // console.log(songs.indexOf(encodeURI(currentSong.src)));        
        // console.log(songs.indexOf(encodeURI(currentSong.src)))
        // console.log(songs.indexOf(currentSong.src.split("/").slice(-1)[0]));
        // let index = songs.indexOf(currentSong.src.split(",").slice(-1)[0])
        // let currentFile = encodeURI(currentSong.src.split("/").slice(-1)[0].replaceAll(" ","%20"));
        // let index = songs.indexOf(currentFile);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }else if(index === songs.length - 1){
            playMusic(songs[0])
        }
    })

    // add event for volume
    document.querySelector(".volume-container").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e.target.value);
        currentSong.volume = e.target.value / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume-container img").src = document.querySelector(".volume-container img").src.replace("img/mute.svg", "img/volume.svg")
        }
        if (currentSong.volume === 0) {
            document.querySelector(".volume-container img").src = document.querySelector(".volume-container img").src.replace("img/volume.svg", "img/mute.svg")
        }

    })


    // add an event listener to mute the track 
    document.querySelector(".volume").addEventListener("click", e => {
        // console.log(e.target);
        // console.log("changing", e.target.src);
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume-container").getElementsByTagName("input")[0].value = 0
        } else if (e.target.src.includes("img/mute.svg")) {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".volume-container").getElementsByTagName("input")[0].value = 10;
        }
    })
    

    // hamburder open/close in mobile
document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0%"
})
document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%"
})






}


main()


// let n = new Audio("songs/Bhajan%5cKaal Bhairav%20-%20Dheeraj%20soni%20SJ%20Shiv%20Ji%20Ka%20Raudra%20Roop%20Powerful%20Energetic%20Shiv%20JI%20Rap%20song.mp3")
// console.log(n);
// n.play()