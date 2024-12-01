const API_KEY = 'AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0'; // APIキーを入力
const PLAYLIST_ID = 'PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5'; // プレイリストID
const MAX_RESULTS = 40; // 最大取得件数

// プレイリストから動画を取得する関数
async function fetchPlaylistVideos(playlistId, maxResults = 40, pageToken = "") {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&pageToken=${pageToken}&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("エラー詳細:", errorData);
    throw new Error("動画の取得に失敗しました。");
  }
  return response.json();
}

// 検索を行う関数
async function searchVideos(query) {
  try {
    let nextPageToken = "";
    let allVideos = [];
    let hasMoreVideos = true;

    // プレイリストの動画を全て取得
    while (hasMoreVideos) {
      const data = await fetchPlaylistVideos(PLAYLIST_ID, MAX_RESULTS, nextPageToken);
      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken || "";
      hasMoreVideos = !!nextPageToken;
    }

    console.log("取得した動画:", allVideos);

    const videos = shuffleArray(allVideos); // シャッフル
    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    // 検索クエリに一致する動画をフィルタリング
    const filteredVideos = videos.filter(video =>
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );

    console.log("フィルタリング後の動画:", filteredVideos);

    if (filteredVideos.length === 0) {
      videosContainer.innerHTML = "<p>検索結果が見つかりませんでした。</p>";
      return;
    }

    // 各動画を表示
    filteredVideos.forEach((video) => {
      const videoId = video.snippet.resourceId.videoId;
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-titles">
            <img id="video-title-icon" src="icon.jpg" alt="">
            <div class="video-title">${video.snippet.title}</div>
            <p class="ch-name">ジャルジャルアイランド JARUJARU ISLAND</p>
          </div>
        </a>
      `;
      videosContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error(error);
    alert("エラーが発生しました。もう一度お試しください。");
  }
}

// 他の動画を取得する関数
async function fetchOtherVideos(query = '') {
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=10&type=video&key=${API_KEY}`;
  if (query) {
    url = `https://www.googleapis.com/youtube/v3/search?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=10&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('その他動画の取得に失敗しました。');
  }
  const data = await response.json();
  return data.items;
}

// URLから動画IDを取得する関数
function getVideoIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('videoId');
}

// ページを初期化する関数
async function initializePage() {
  const videoId = getVideoIdFromURL();
  if (!videoId) {
    alert('動画IDが見つかりません。');
    return;
  }

  // 動画の詳細情報を取得
  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
  const videoDetailsResponse = await fetch(videoDetailsUrl);
  if (!videoDetailsResponse.ok) {
    console.error('動画の詳細情報の取得に失敗しました。');
    return;
  }
  const videoDetailsData = await videoDetailsResponse.json();
  const videoTitle = videoDetailsData.items[0]?.snippet.title || '動画';

  // タイトルをページのタブに設定
  document.title = videoTitle;

  // 動画プレイヤーの自動再生を有効に
  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  try {
    const otherVideos = await fetchOtherVideos();
    const otherVideosContainer = document.getElementById('otherVideos');
    otherVideosContainer.innerHTML = '';

    otherVideos.forEach(video => {
      const otherVideoId = video.id.videoId;
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      videoCard.innerHTML = `
        <a class="video-a" href="video.html?videoId=${otherVideoId}">
          <img src="https://img.youtube.com/vi/${otherVideoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-info">
            <div class="video-title">${video.snippet.title}</div>
          </div>
        </a>
      `;
      otherVideosContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error(error);
    alert('その他動画の取得に失敗しました。');
  }
}

// 検索ボタンのイベントリスナーを設定
document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchQuery').value.trim();
  if (query) {
    try {
      const otherVideos = await fetchOtherVideos(query);
      const otherVideosContainer = document.getElementById('otherVideos');
      otherVideosContainer.innerHTML = '';

      otherVideos.forEach(video => {
        const otherVideoId = video.id.videoId;
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
          <a href="video.html?videoId=${otherVideoId}">
            <img src="https://img.youtube.com/vi/${otherVideoId}/mqdefault.jpg" alt="${video.snippet.title}">
            <div class="video-info">
              <div class="video-title">${video.snippet.title}</div>
            </div>
          </a>
        `;
        otherVideosContainer.appendChild(videoCard);
      });
    } catch (error) {
      console.error(error);
      alert('検索に失敗しました。');
    }
  }
});

// ページ読み込み時に初期化
initializePage();

// メニューの開閉を制御する関数
function toggleMenu() {
  const sideMenu = document.getElementById("sidemenu");
  const hum = document.querySelector(".hum");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.toggle("open");
  hum.classList.toggle("open");
  overlay.classList.toggle("active");
  document.body.style.overflow = sideMenu.classList.contains("open") ? "hidden" : "auto";
}

// オーバーレイをクリックしたときメニューを閉じる
document.getElementById("overlay").addEventListener("click", () => {
  const sideMenu = document.getElementById("sidemenu");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});
