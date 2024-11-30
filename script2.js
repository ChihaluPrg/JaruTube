const API_KEY = "AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0"; // APIキーを入力
const PLAYLIST_ID = "PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5"; // プレイリストID
const CHANNEL_ID = 'UCf-wG6PlxW7rpixx1tmODJw'; // 対象のチャンネルID
const MAX_RESULTS = 40;

// 配列をシャッフルする関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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

// チャンネルから動画を取得する関数
async function fetchChannelVideos(channelId, maxResults = 40, pageToken = "") {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&pageToken=${pageToken}&key=${API_KEY}&order=date`;
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

    // 複数ページを取得するためのループ
    while (hasMoreVideos) {
      const data = await fetchChannelVideos(CHANNEL_ID, MAX_RESULTS, nextPageToken);
      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken || "";
      hasMoreVideos = !!nextPageToken; // 次ページがあれば続行
    }

    console.log("取得した動画:", allVideos); // デバッグ用ログ

    const videos = shuffleArray(allVideos); // シャッフル

    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    // 検索クエリに一致する動画をフィルタリング
    const filteredVideos = videos.filter(video =>
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );

    console.log("フィルタリング後の動画:", filteredVideos); // デバッグ用ログ

    if (filteredVideos.length === 0) {
      videosContainer.innerHTML = "<p>検索結果が見つかりませんでした。</p>";
      return;
    }

    // 各動画を表示
    filteredVideos.forEach((video) => {
      const videoId = video.id.videoId;
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-titles">
            <img id="video-title-icon" src="icon.jpg" alt="">
            <div class="video-title">${video.snippet.title}</div>
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

// 動画を表示する関数（検索していない場合）
async function displayVideos() {
  try {
    const initialData = await fetchPlaylistVideos(PLAYLIST_ID, 1); // 最初に取得（nextPageTokenを得るため）
    const totalPages = Math.ceil(initialData.pageInfo.totalResults / MAX_RESULTS);

    // ランダムなページ番号を選ぶ
    const randomPage = Math.floor(Math.random() * totalPages);

    // ランダムなページへ移動する
    let pageToken = "";
    for (let i = 0; i < randomPage; i++) {
      const nextPageData = await fetchPlaylistVideos(PLAYLIST_ID, MAX_RESULTS, pageToken);
      pageToken = nextPageData.nextPageToken || ""; // 次ページのトークンを取得
    }

    // 選ばれたページから動画を取得
    const data = await fetchPlaylistVideos(PLAYLIST_ID, MAX_RESULTS, pageToken);
    const videos = shuffleArray(data.items); // シャッフル
    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    if (videos.length === 0) {
      videosContainer.innerHTML = "<p>動画が見つかりませんでした。</p>";
      return;
    }

    // 各動画を表示
    videos.forEach((video) => {
      const videoId = video.snippet.resourceId.videoId;
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-titles">
            <img id="video-title-icon" src="icon.jpg" alt="">
            <div class="video-title">${video.snippet.title}</div>
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

// 検索ボタンのイベントリスナー
document.getElementById("searchButton").addEventListener("click", async () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (query) {
    console.log(`検索ワード: ${query}`); // デバッグ用ログ
    await searchVideos(query);
  } else {
    alert("検索ワードを入力してください。");
  }
});

// 初期表示
displayVideos();




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
