let currentSong = document.getElementById("audioPlayer");
let songs = [];
let currentIndex = -1;

// Playbar controls
let playBtn = document.getElementById("play");
let nextBtn = document.getElementById("next");
let prevBtn = document.getElementById("previous");
let songInfo = document.querySelector(".songinfo");
let songTime = document.querySelector(".songtime");
let seekbar = document.querySelector(".seekbar");
let circle = document.querySelector(".circle");
let songList = document.querySelector(".songList ul");

// ---------------------------
// Load songs dynamically
// ---------------------------
async function loadSongs(folder) {
    try {
        songs = [];
        songList.innerHTML = "";

        let response = await fetch(`/songs/${folder}/`);
        let html = await response.text();

        let div = document.createElement("div");
        div.innerHTML = html;

        let links = div.querySelectorAll("a");

        links.forEach(link => {
            let href = link.getAttribute("href");
            if (href && href.endsWith(".mp3")) {
                let songName = decodeURIComponent(href.split("/").pop())
                    .replace(".mp3", "")
                    .replace(/\[.*?\]/g, "")
                    .trim();

                songs.push({ file: href, name: songName });

                let li = document.createElement("li");
                li.innerHTML = `
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div class="songname">${songName}</div>
                        <div class="songartist">${folder}</div>
                    </div>
                    <div class="playnow">
                        <span>play now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                `;

                li.addEventListener("click", () => {
                    currentIndex = songs.findIndex(s => s.file === href);
                    playSong(songs[currentIndex].file, songs[currentIndex].name);
                });

                songList.appendChild(li);
            }
        });

        // Play first song by default
        if (songs.length > 0) {
            currentIndex = 0;
            playSong(songs[0].file, songs[0].name);
        }
    } catch (err) {
        console.error("Error loading songs:", err);
    }
}

// ---------------------------
// Play a song
// ---------------------------
function playSong(file, name) {
    currentSong.src = file;
    currentSong.play();
    playBtn.src = "pause.svg";
    songInfo.textContent = name;
    songTime.textContent = "00:00 / 00:00";

    document.querySelectorAll(".songList ul li").forEach((li, index) => {
        li.classList.toggle("active", index === currentIndex);
    });
}

// ---------------------------
// Playbar controls
// ---------------------------
playBtn.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        playBtn.src = "pause.svg";
    } else {
        currentSong.pause();
        playBtn.src = "play.svg";
    }
});

nextBtn.addEventListener("click", () => {
    if (songs.length > 0) {
        currentIndex = (currentIndex + 1) % songs.length;
        playSong(songs[currentIndex].file, songs[currentIndex].name);
    }
});

prevBtn.addEventListener("click", () => {
    if (songs.length > 0) {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playSong(songs[currentIndex].file, songs[currentIndex].name);
    }
});

currentSong.addEventListener("loadedmetadata", () => {
    let total = formatTime(currentSong.duration);
    songTime.textContent = `00:00 / ${total}`;
});

currentSong.addEventListener("timeupdate", () => {
    if (currentSong.duration) {
        let progress = (currentSong.currentTime / currentSong.duration) * 100;
        circle.style.left = progress + "%";

        let current = formatTime(currentSong.currentTime);
        let total = formatTime(currentSong.duration);
        songTime.textContent = `${current} / ${total}`;
    }
});

seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / seekbar.offsetWidth);
    currentSong.currentTime = percent * currentSong.duration;
});

currentSong.addEventListener("ended", () => {
    nextBtn.click();
});

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

// ---------------------------
// Load cards dynamically
// ---------------------------
async function loadCards() {
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // clear existing

    const folders = ["nocopy", "copy","ar reheman","yo yo honey","anirudh","arjit singh","atif salam","pritam chillar"];
    for (let folder of folders) {
        try {
            const res = await fetch(`songs/${folder}/info.json`);
            if (!res.ok) throw new Error("JSON not found");
            const data = await res.json();

            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-folder", folder);
            card.innerHTML = `
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#00C853" />
                        <g transform="scale(0.83) translate(2.1, 2.1)">
                            <path d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
                        </g>
                    </svg>
                </div>
                <img src="${data.image}" alt="${data.title}">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            `;
            cardContainer.appendChild(card);

            card.addEventListener("click", () => loadSongs(folder));

        } catch (err) {
            console.error(`Failed to load card for folder ${folder}:`, err);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCards();      // load the cards
    loadSongs("nocopy"); // load default songs

    // sidebar toggle code here
});

    const leftSection = document.querySelector(".left");
    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close");

    hamburger.addEventListener("click", () => {
        if (window.innerWidth <= 1400) leftSection.style.left = "0";
    });

    closeBtn.addEventListener("click", () => {
        if (window.innerWidth <= 1400) leftSection.style.left = "-120%";
    });

    if (window.innerWidth <= 1400) {
        leftSection.style.left = "-120%";
        closeBtn.style.display = "block";
    } else {
        leftSection.style.left = "0";
        closeBtn.style.display = "none";
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth <= 1400) {
            leftSection.style.left = "-120%";
            closeBtn.style.display = "block";
        } else {
            leftSection.style.left = "0";
            closeBtn.style.display = "none";
        }
    });

