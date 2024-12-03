const API_KEY = "AIzaSyBbY4j6K7TbMLIX1X1PfjxPXW4K8qDm7n0"; // APIキー
const PLAYLIST_ID = "PLsRy2iansSOBfjNIy-9dwsF0s4-5ALMW5"; // プレイリストID
const CHANNEL_ID = 'UCf-wG6PlxW7rpixx1tmODJw'; // 対象のチャンネルID
const MAX_RESULTS = 40;
// モーダル要素を取得
const videoPopup = document.getElementById("videoPopup");
const videoFrame = document.getElementById("videoFrame");
const closePopup = document.getElementById("closePopup");


// 動画カードをクリックした際にモーダルを表示する関数
function openVideoModal(videoId) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`; // rel=0 を追加
  videoPopup.style.display = "block";
  document.body.style.overflow = "hidden"; // 背景スクロールを無効化
}


// モーダルを閉じる関数
function closeVideoModal() {
  videoPopup.style.display = "none";
  videoFrame.src = ""; // 再生を停止
  document.body.style.overflow = "auto"; // 背景スクロールを有効化
}

// 閉じるボタンにイベントリスナーを追加
closePopup.addEventListener("click", closeVideoModal);

// 動画カードにクリックイベントを追加
// 動画カードにクリックイベントを追加
document.getElementById("videos").addEventListener("click", (event) => {
  const videoCard = event.target.closest(".video-card");
  if (!videoCard) return;

  // デフォルトのリンク遷移を無効化
  event.preventDefault();

  // 動画IDを取得してモーダルを開く
  const videoId = videoCard.querySelector("a").href.split("videoId=")[1];
  if (videoId) openVideoModal(videoId);
});


// オーバーレイ部分をクリックした際にモーダルを閉じる
window.addEventListener("click", (event) => {
  if (event.target === videoPopup) {
    closeVideoModal();
  }
});

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
document.querySelectorAll(".list a").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault(); // デフォルト動作を無効化

    // ページを一番上までスクロール
    window.scrollTo({
      top: 0,
      behavior: "smooth", // スムーズなスクロールを指定
    });

    // 選択されたプレイリストIDを取得
    const playlistId = event.target.getAttribute("data-playlist-id");

    if (playlistId) {
      console.log(`選択されたプレイリストID: ${playlistId}`); // デバッグ用
      await displayVideosByPlaylist(playlistId); // プレイリストに基づいて動画を表示
    } else {
      console.error("プレイリストIDが取得できませんでした。");
    }
  });
});

let currentVideoIndex = 0; // 現在の動画のインデックス
let videoList = []; // 動画情報を格納する配列

// 動画を再生する関数
function playNextVideo() {
  if (currentVideoIndex < videoList.length - 1) {
    currentVideoIndex++; // 次の動画のインデックスを設定
    const nextVideo = videoList[currentVideoIndex];
    videoFrame.src = `https://www.youtube.com/embed/${nextVideo.id.videoId}?autoplay=1`;
  } else {
    console.log("これ以上再生する動画はありません。");
  }
}

// 動画が終わったときのイベントリスナーを追加
videoFrame.addEventListener("ended", playNextVideo);

// 動画のリストを取得する関数
async function fetchAndDisplayVideos(playlistId) {
  try {
    const data = await fetchPlaylistVideos(playlistId, MAX_RESULTS);
    videoList = data.items; // 動画情報を格納
    currentVideoIndex = 0; // 再生インデックスをリセット

    if (videoList.length > 0) {
      const firstVideo = videoList[currentVideoIndex];
      videoFrame.src = `https://www.youtube.com/embed/${firstVideo.id.videoId}?autoplay=1`;
    }
  } catch (error) {
    console.error("動画の取得に失敗しました。", error);
  }
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

    filteredVideos.forEach((video) => {
      const videoId = video.id.videoId;
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <div class="video-thumbnail">
            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
            <div class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
          </div>
          <div class="video-titles">
            <img id="video-title-icon" src="icon.jpg" alt="">
            <div class="video-title">${video.snippet.title}</div>
            <div class="chn"><p class="ch-name">ジャルジャルアイランド JARUJARU ISLAND</p></div>
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
// 動画詳細を取得する関数
async function fetchVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error("動画詳細の取得に失敗しました");
    return null;
  }
  const data = await response.json();
  return data.items[0]?.snippet.publishedAt || null; // 公開日を返す
}

// 動画を表示する関数（ランダム性をさらに高め、正しい公開日を表示）

document.querySelectorAll(".list a").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault(); // デフォルト動作を無効化

    // 選択されたプレイリストIDを取得
    const playlistId = event.target.getAttribute("data-playlist-id");

    if (playlistId) {
      console.log(`選択されたプレイリストID: ${playlistId}`); // デバッグ用
      await displayVideosByPlaylist(playlistId); // プレイリストに基づいて動画を表示
    } else {
      console.error("プレイリストIDが取得できませんでした。");
    }
  });
});

// 各リンクにイベントリスナーを追加してクリック時にプレイリストを表示
document.querySelectorAll(".list a").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault(); // デフォルト動作を無効化
    const playlistId = event.target.getAttribute("data-playlist-id");

    if (playlistId) {
      console.log(`選択されたプレイリストID: ${playlistId}`); // デバッグ用
      await displayVideosByPlaylist(playlistId); // プレイリストを表示
    } else {
      console.error("プレイリストIDが取得できませんでした。");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "block"; // 取得中メッセージを表示

  try {
    const initialPlaylistId = "PLsRy2iansSOCrqZ24JhoeAFl1sGW196x7"; // 初期表示するプレイリストID
    await displayVideosByPlaylist(initialPlaylistId);
  } catch (error) {
    console.error("初期読み込み時のエラー:", error);
  } finally {
    loadingMessage.style.display = "none"; // 初期読み込み完了後に非表示
  }
});

// displayVideosByPlaylist 関数の修正：非同期処理を正しく管理
async function displayVideosByPlaylist(playlistId) {
  const loadingMessage = document.getElementById("loadingMessage");
  try {
    loadingMessage.style.display = "block"; // 動画取得処理の開始時にメッセージを表示

    let allVideos = [];
    let nextPageToken = "";

    while (true) {
      const data = await fetchPlaylistVideos(playlistId, MAX_RESULTS, nextPageToken);
      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken || "";
      if (!nextPageToken) break; // 次ページがなければ終了
    }

    if (allVideos.length === 0) {
      document.getElementById("videos").innerHTML = "<p>動画が見つかりませんでした。</p>";
      return;
    }

    // シャッフルして表示
    const shuffledVideos = shuffleArray(allVideos);
    const videosContainer = document.getElementById("videos");
    videosContainer.innerHTML = ""; // 前回の結果をクリア

    shuffledVideos.forEach((video) => {
      const videoId = video.snippet.resourceId.videoId;
      const videoTitle = video.snippet.title;

      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <a href="video.html?videoId=${videoId}">
          <img class="card-img" src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.snippet.title}">
          <div class="video-titles">
            <img id="video-title-icon" src="tower-logo.jpg" alt="">
            <div class="video-title">${video.snippet.title}</div>
            
          </div>
          
        </a>
      `;
      videosContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    loadingMessage.style.display = "none"; // 処理が完了した後にメッセージを非表示
  }
}


// オーバーレイをクリックしたときメニューを閉じる
document.getElementById("overlay").addEventListener("click", () => {
  const sideMenu = document.getElementById("sidemenu");
  const overlay = document.getElementById("overlay");

  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});




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


// メニューの開閉を制御する関数
function toggleMenu() {
  const sideMenu = document.getElementById("sidemenu");
  const hum2 = document.querySelector(".hum2");
  const overlay = document.getElementById("overlay");
  const playlistLinks = document.querySelectorAll('.playlist');

  sideMenu.classList.toggle("open");
  hum2.classList.toggle("open");
  overlay.classList.toggle("active");

  if (sideMenu.classList.contains("open")) {
    console.log("Menu opened");
    
    // メニューが開いたときに各リンクに 'open' クラスを追加
    playlistLinks.forEach(link => {
      link.classList.add('open');

      // リンクにクリックイベントを追加してメニューを閉じる
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  } else {
    console.log("Menu toggled - closed");

    // メニューが閉じたときに各リンクから 'open' クラスを削除
    playlistLinks.forEach(link => {
      link.classList.remove('open');
    });

  }
}

// メニューを閉じる共通関数
function closeMenu() {
  const sideMenu = document.getElementById("sidemenu");
  const overlay = document.getElementById("overlay");
  const body = document.body;
  const playlistLinks = document.querySelectorAll('.playlist');

  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
  body.style.overflow = "auto";
  body.style.paddingRight = "0";

  // 各リンクから 'open' クラスを削除
  playlistLinks.forEach(link => {
    link.classList.remove('open');
  });

  console.log("Menu closed"); // デバッグ用
}

// オーバーレイをクリックしたときメニューを閉じる
document.getElementById("overlay").addEventListener("click", closeMenu);
