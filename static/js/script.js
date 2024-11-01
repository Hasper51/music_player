document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired');
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const repeatButton = document.getElementById("repeat");
  const shuffleButton = document.getElementById("shuffle");
  const audio = document.getElementById("audio");
  const songImage = document.getElementById("song-image");
  const songName = document.getElementById("song-name");
  const songArtist = document.getElementById("song-artist");
  const pauseButton = document.getElementById("pause");
  const playButton = document.getElementById("play");
  const playlistButton = document.getElementById("playlist");
  const maxDuration = document.getElementById("max-duration");
  const currentTimeRef = document.getElementById("current-time");
  const progressBar = document.getElementById("progress-bar");
  const playlistContainer = document.getElementById("playlist-container");
  const closeButton = document.getElementById("close-button");
  const playlistSongs = document.getElementById("playlist-songs");
  const currentProgress = document.getElementById("current-progress");



  let lyricsData;
  //index for songs
  let index;

  //initially loop=true
  let loop = true;


  //events object
  let events = {
    mouse: {
      click: "click",
    },
    touch: {
      click: "touchstart",
    },
  };

  let deviceType = "";

  //Detect touch device

  const isTouchDevice = () => {
    try {
      //We try to create TouchEvent(it would fail for desktops and throw error)
      document.createEvent("TouchEvent");
      deviceType = "touch";
      return true;
    } catch (e) {
      deviceType = "mouse";
      return false;
    }
  };

  //Format time (convert ms to seconds, minutes and add 0 id less than 10)
  const timeFormatter = (timeInput) => {
    let minute = Math.floor(timeInput / 60);
    minute = minute < 10 ? "0" + minute : minute;
    let second = Math.floor(timeInput % 60);
    second = second < 10 ? "0" + second : second;
    return `${minute}:${second}`;
  };


  let songs = await fetch('/api/songs/')
    .then(response => response.json())
    .catch(error => console.error("Ошибка загрузки песен:", error));
  //set song
  const setSong = async (currentSongIndex) => {
    let { title, artist, image, audio_file, lyrics } = songs[currentSongIndex];
    audio.src = audio_file;
    songName.innerHTML = title;
    songArtist.innerHTML = artist;
    songImage.src = image;

    try {
      lyricsData = JSON.parse(lyrics);
    } catch (e) {
      console.error('Failed to parse lyrics:', e);
      lyricsData = [];  // Устанавливаем пустой массив в случае ошибки
    }

    const audioBlob = await fetch(audio_file)
      .then(response => {
        // Проверка типа содержимого
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("audio")) {
          throw new Error("Получен неправильный MIME-тип для аудио");
        }
        return response.blob();
      })
      .catch(error => console.error("Ошибка загрузки аудио:", error));

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;

      // Ожидаем события 'canplay', прежде чем вызвать play()
      audio.addEventListener('canplay', () => {
        audio.play()
          .then(() => {
            pauseButton.classList.remove("hide");
            playButton.classList.add("hide");
          })
          .catch(error => console.error("Ошибка при попытке воспроизведения:", error));
      }, { once: true }); // Обработчик удалится после первого срабатывания

      audio.load();

      
    }
    audio.onloadedmetadata = () => {
      maxDuration.innerText = timeFormatter(audio.duration);
    };

    // Генерируем лирику только если есть данные
    if (lyricsData && lyricsData.length > 0) {
      generate();
    } else {
      $('.lyrics').html('<div>Lyrics not available</div>');
    }
  };

  function align() {
    const highlightedElement = $('.highlighted');

    // Проверяем существует ли элемент с классом 'highlighted'
    if (highlightedElement.length === 0) return;

    const contentElement = $('.content');

    // Проверяем существует ли элемент с классом 'content'
    if (contentElement.length === 0) return;

    const highlightedHeight = highlightedElement.height();
    const contentHeight = contentElement.height();

    // Проверяем, что у элементов есть родители и они существуют
    if (!highlightedElement.parent().length || !highlightedElement.offset()) return;

    const topOffset = highlightedElement.offset().top - highlightedElement.parent().offset().top;
    const scrollPosition = topOffset + (highlightedHeight / 3) - (contentHeight / 3);

    contentElement.animate(
      { scrollTop: scrollPosition + 'px' },
      { easing: 'swing', duration: 250 }
    );
  }

  function generate() {
    // Проверяем существование lyricsData
    if (!lyricsData || !Array.isArray(lyricsData)) {
      console.error('No lyrics data available');
      $('.lyrics').html('<div>Lyrics not available</div>');
      return;
    }

    let html = '';

    for (let i = 0; i < lyricsData.length; i++) {
      html += '<div';
      if (i === 0) {
        html += ` class="highlighted"`;
        currentLine = 0;
      }
      if (lyricsData[i]['note']) {
        html += ` note="${lyricsData[i]['note']}"`;
      }
      html += '>';
      html += lyricsData[i]['lyrics'] == '' ? '•' : lyricsData[i]['lyrics'];
      html += '</div>';
    }

    const lyricsElement = $('.lyrics');
    lyricsElement.html(html);

    // Делаем небольшую задержку перед вызовом align(), 
    // чтобы DOM успел обновиться
    setTimeout(() => {
      align();
    }, 100);
  }

  // Обработчик изменения размера окна
  let lyricHeight = $('.lyrics').height();
  $(window).on('resize', function () {
    const currentHeight = $('.lyrics').height();
    if (currentHeight !== lyricHeight) {
      lyricHeight = currentHeight;
      if ($('.highlighted').length > 0) {  // Проверяем наличие highlighted элемента
        align();
      }
    }
  });

  // Обработчик обновления времени аудио
  $(document).ready(function () {
    $('audio').on('timeupdate', function (e) {
      const time = this.currentTime * 1000;

      // Проверяем существование lyricsData
      if (!lyricsData || !Array.isArray(lyricsData)) return;

      const past = lyricsData.filter(function (item) {
        return item.time < time;
      });

      const nextLineIndex = past.length;

      // Проверяем, что индекс находится в пределах массива
      if (nextLineIndex >= 0 && nextLineIndex < lyricsData.length) {
        const nextLine = lyricsData[nextLineIndex];

        if (nextLine !== currentLine) {
          currentLine = nextLine;
          $('.lyrics div').removeClass('highlighted');
          $(`.lyrics div:nth-child(${nextLineIndex})`).addClass('highlighted');

          // Проверяем наличие highlighted элемента перед вызовом align
          if ($('.highlighted').length > 0) {
            align();
          }
        }
      }
    });
  });

  //play song
  const playAudio = () => {
    audio.play();
    pauseButton.classList.remove("hide");
    playButton.classList.add("hide");
  };

  //repeat button
  repeatButton.addEventListener("click", () => {
    if (repeatButton.classList.contains("active")) {
      repeatButton.classList.remove("active");
      audio.loop = false;
      console.log("repeat off");
    } else {
      repeatButton.classList.add("active");
      audio.loop = true;
      console.log("repeat on");
    }
  });

  //Next song
  const nextSong = () => {
    //if loop is true then continue in normal order
    if (loop) {
      if (index == songs.length - 1) {
        //If last song is being played
        index = 0;
      } else {
        index += 1;
      }
      setSong(index);

      
    } else {
      //else find a random index and play that song
      let randIndex = Math.floor(Math.random() * songs.length);
      console.log(randIndex);
      setSong(randIndex);
      
    }
  };

  //pause song
  const pauseAudio = () => {
    audio.pause();
    pauseButton.classList.add("hide");
    playButton.classList.remove("hide");
  };

  //previous song ( you can't go back to a randomly played song)
  const previousSong = () => {
    if (index > 0) {
      pauseAudio();
      index -= 1;
    } else {
      //if first song is being played
      index = songs.length - 1;
    }
    setSong(index);
    
  };

  //next song when current song ends
  audio.onended = () => {
    nextSong();
  };

  //Shuffle songs
  shuffleButton.addEventListener("click", () => {
    if (shuffleButton.classList.contains("active")) {
      shuffleButton.classList.remove("active");
      loop = true;
      console.log("shuffle off");
    } else {
      shuffleButton.classList.add("active");
      loop = false;
      console.log("shuffle on");
    }
  });

  //play button
  playButton.addEventListener("click", playAudio);

  //next button
  nextButton.addEventListener("click", nextSong);

  //pause button
  pauseButton.addEventListener("click", pauseAudio);

  //prev button
  prevButton.addEventListener("click", previousSong);

  //if user clicks on progress bar
  isTouchDevice();
  progressBar.addEventListener(events[deviceType].click, (event) => {
    //start of progressBar
    let coordStart = progressBar.getBoundingClientRect().left;

    //mouse click position
    let coordEnd = !isTouchDevice() ? event.clientX : event.touches[0].clientX;

    let progress = (coordEnd - coordStart) / progressBar.offsetWidth;


    //set width to progress
    currentProgress.style.width = progress * 100 + "%";

    //set time

    if (audio.duration > 0) {
      audio.currentTime = progress * audio.duration;

      // Ожидаем небольшую задержку, чтобы audio.currentTime обновился
      setTimeout(() => {
        audio.play();
        pauseButton.classList.remove("hide");
        playButton.classList.add("hide");
      }, 50);
    }



  });

  //update progress every second
  setInterval(() => {
    currentTimeRef.innerHTML = timeFormatter(audio.currentTime);
    currentProgress.style.width =
      (audio.currentTime / audio.duration.toFixed(3)) * 100 + "%";
  });

  //update time
  audio.addEventListener("timeupdate", () => {

    currentTimeRef.innerText = timeFormatter(audio.currentTime);
  });

  //Creates playlist
  const initializePlaylist = () => {
    for (let i in songs) {
      playlistSongs.innerHTML += `<li class='playlistSong' data-song-index="${i}">
            <div class="playlist-image-container">
                <img src="${songs[i].image}"/>
            </div>
            <div class="playlist-song-details">
                <span id="playlist-song-name">
                    ${songs[i].title}
                </span>
                <span id="playlist-song-artist-album">
                    ${songs[i].artist}
                </span>
            </div>
        </li>`;
    }
  };

  // Добавляем один обработчик на контейнер плейлиста
  playlistSongs.addEventListener('click', (e) => {
    const songItem = e.target.closest('.playlistSong');
    if (songItem) {
      const index = songItem.dataset.songIndex;
      setSong(Number(index));
      playlistContainer.style.display = 'none';
      // playlistContainer.classList.add("hide");
      playAudio();
    }
  });

  //display playlist
  playlistButton.addEventListener("click", () => {
    playlistContainer.style.display = 'flex';
    // playlistContainer.classList.remove("hide");
  });

  //hide playlist
  closeButton.addEventListener("click", () => {
    playlistContainer.style.display = 'none';
    // playlistContainer.classList.add("hide");
  });

  // window.onload = () => {
  //   console.log('window.onload');
  //   index = 0;
  //   setSong(index);

  // };  
  const initializePlayer = () => {
    console.log('initializePlayer');
    index = 0;
    setSong(index);
    initializePlaylist();
  };

  // Вызываем функцию после всех определений
  initializePlayer();

});