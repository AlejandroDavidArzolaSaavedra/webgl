document.addEventListener('DOMContentLoaded', function() {
    const songs = [
        { title: "Hay un amigo en mí...", src: "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/videoplayback.m4a?v=1730150241532" },
        { title: "Cuando me quería...", src: "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/videoplayback%20(1).m4a?v=1730151604717" },
        { title: "En el espacio...", src: "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/videoplayback%20(2).m4a?v=1730152211327" }
    ];
    let currentSongIndex = 0;
    const audioPlayer = document.getElementById('audio-player');
    const songTitle = document.getElementById('song-title');
    const playPauseBtn = document.getElementById('play-pause');

    function loadSong(index) {
        audioPlayer.src = songs[index].src;
        songTitle.textContent = songs[index].title;
        audioPlayer.load();
    }

    window.togglePlayPause = function() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.classList.replace('fa-play', 'fa-pause');
        } else {
            audioPlayer.pause();
            playPauseBtn.classList.replace('fa-pause', 'fa-play');
        }
    }

    window.nextSong = function() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        audioPlayer.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
    }

    window.previousSong = function() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        audioPlayer.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
    }

    audioPlayer.addEventListener('ended', window.nextSong);
    loadSong(currentSongIndex);
});
