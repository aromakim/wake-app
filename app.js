// ===== 상태 변수 =====

// 필터 요약
let filterSummary = {
  gender: "모두",
  rating: 0,
  distance: 10,
  location: "같은 칸",
};

// 헬퍼가 수락한 요청 ID
let acceptedRequestId = null;

// 헬퍼 요청 더미 데이터
const helperRequestData = {
  req1: { station: "강남역", remain: 2, distance: "30m" },
  req2: { station: "잠실역", remain: 3, distance: "60m" },
  req3: { station: "서울역", remain: 1, distance: "20m" },
};

// 알람 설정 상태
let alarmSettings = {
  vibrate: true,
  sound: true,
  strong: false,
};

const screens = [
  "initScreen",
  "homeScreen",
  "alarmSettingsScreen",
  "requestScreen",
  "filterScreen",
  "qrShowScreen",
  "idScreen",
  "helperListScreen",
  "helperActiveScreen",
  "qrScanScreen",
  "doneScreen",
  "myPageScreen",
  "shopScreen",
];

// ===== 공통 화면 전환 =====
function showScreen(id) {
  screens.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    if (s === id) {
      el.classList.add("screen--active", "screen--fade");
    } else {
      el.classList.remove("screen--active", "screen--fade");
    }
  });

  // My Page 버튼 노출 제어
  const myPageBtn = document.querySelector(".mypage-btn");
  if (myPageBtn) {
    if (id === "initScreen") {
      myPageBtn.style.display = "none";
    } else {
      myPageBtn.style.display = "";
    }
  }
}

// 홈 → 하차 요청
function goToRequest() {
  showScreen("requestScreen");
}

// 서비스 소개 모달
function openAbout() {
  showModal(
    "깨워주세요는 졸아서 하차역을 놓치는 문제를 해결하기 위해, " +
      "같은 칸에 있는 사람과 앱 알림을 함께 활용하는 하차 도우미 서비스입니다."
  );
}

// ===== 인앱 토스트/모달 =====
let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("toast--show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("toast--show");
  }, 2000);
}

function showModal(message) {
  const overlay = document.getElementById("modalOverlay");
  const msgEl = document.getElementById("modalMessage");
  msgEl.textContent = message;
  overlay.classList.add("modal-overlay--show");
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("modal-overlay--show");
}

// ===== 하차 알림 설정 =====
function saveAlarmSettings() {
  alarmSettings.vibrate = document.getElementById("vibrateToggle").checked;
  alarmSettings.sound = document.getElementById("soundToggle").checked;
  alarmSettings.strong = document.getElementById("strongToggle").checked;

  showToast("하차 알림 설정이 저장되었습니다.");
  showScreen("homeScreen");
}

function testAlarmPreview() {
  let modeText = "";

  if (alarmSettings.vibrate) modeText += "진동 ";
  if (alarmSettings.sound) modeText += "소리 ";
  if (alarmSettings.strong) modeText += "(강한 알림 모드)";

  if (!modeText) {
    modeText = "알림이 모두 꺼져 있습니다.";
  } else {
    modeText = "하차 알림이 " + modeText.trim() + "으로 울립니다.";
  }

  showModal(modeText);
}

// ===== 필터 적용 =====
function applyFilter() {
  const genderMap = {
    all: "모두",
    male: "남성만",
    female: "여성만",
  };

  const gender = document.getElementById("genderFilter").value;
  const rating = document.getElementById("ratingFilter").value;
  const distance = document.getElementById("distanceFilter").value;

  filterSummary.gender = genderMap[gender];
  filterSummary.rating = rating;
  filterSummary.distance = distance;

  showToast("필터가 적용되었습니다.");
  showScreen("requestScreen");
}

// ===== 요청 보내기 (요청자) =====
function sendRequest() {
  const station = document.getElementById("stationInput").value.trim();

  if (!station) {
    showToast("하차역을 입력해주세요.");
    return;
  }

  showModal(
    station +
      " 하차 요청이 전송되었습니다.\n" +
      "근처 조건에 맞는 헬퍼에게 알림이 전송되며,\n" +
      "도움이 수락되면 추가 알림이 표시됩니다."
  );

  // 실제 서비스에서는 여기서 서버에 전송
  // 지금은 바로 QR 제시 화면으로 이동
  showScreen("qrShowScreen");
}

// ===== ID로 포인트 지급 (요청자 → 헬퍼) =====
function givePointsByID() {
  const idValue = document.getElementById("idInput").value.trim();
  if (!idValue) {
    showToast("상대 ID를 입력해주세요.");
    return;
  }

  showModal("ID 확인 완료! 포인트가 지급되었습니다.");
  showScreen("doneScreen");
}

// ===== 헬퍼 모드 관련 =====
function acceptRequest(id) {
  if (acceptedRequestId && acceptedRequestId !== id) {
    showToast("이미 다른 요청을 수락한 상태입니다.");
    return;
  }

  acceptedRequestId = id;
  const data = helperRequestData[id];

  const remain = data.remain;
  document.getElementById("activeStation").innerText = data.station + " 하차";
  document.getElementById("activeMeta").innerText =
    remain + "정거장 남음 · 약 " + data.distance + " 거리";
  document.getElementById("activeRemain").innerText = remain.toString();
  updateProgressBar(remain);

  const cards = document.querySelectorAll(".helper-card");
  cards.forEach((card) => {
    const btn = card.querySelector("button");
    if (!btn) return;

    if (card.dataset.id === id) {
      btn.innerText = "수락됨";
      btn.disabled = true;
    } else {
      btn.innerText = "다른 헬퍼가 수락함";
      btn.disabled = true;
      card.classList.add("helper-card--disabled");
    }
  });

  showModal(
    "도움을 수락했습니다.\n하차역에 도착할 때까지 승객을 살펴봐 주세요."
  );
  showScreen("helperActiveScreen");
}

function cancelActiveHelp() {
  // 진행 중 도움 취소
  acceptedRequestId = null;
  // 카드 상태 리셋
  const cards = document.querySelectorAll(".helper-card");
  cards.forEach((card) => {
    const btn = card.querySelector("button");
    if (!btn) return;
    card.classList.remove("helper-card--disabled");
    btn.disabled = false;
    btn.innerText = "수락하기";
  });

  showScreen("helperListScreen");
}

// 정거장 1개 지남 (헬퍼용, 작은 버튼)
function decreaseRemain() {
  const remainEl = document.getElementById("activeRemain");
  let remain = parseInt(remainEl.innerText, 10);

  if (remain <= 0) {
    showToast("이미 하차역에 도착했습니다.");
    return;
  }

  remain -= 1;
  remainEl.innerText = remain.toString();
  updateProgressBar(remain);

  if (remain === 1) {
    showToast("하차 1정거장 전입니다.");
  } else if (remain === 0) {
    showModal("하차역에 도착했습니다. 승객을 깨워주세요.");
  }
}

function updateProgressBar(remain) {
  const total = 3;
  const done = Math.min(total, Math.max(0, total - remain));
  const percent = (done / total) * 100;
  document.getElementById("activeProgress").style.width = percent + "%";
}

// 헬퍼 → QR 스캔 화면
function goToQRFromHelper() {
  showScreen("qrScanScreen");
  showToast("승객이 보여주는 QR을 스캔해 포인트를 받으세요.");
}

// QR 스캔 시뮬레이션 (작은 버튼)
function simulateScan() {
  const box = document.getElementById("cameraBox");
  box.textContent = "QR을 인식 중입니다...";

  setTimeout(() => {
    box.textContent = "인식 완료! 포인트가 적립되었습니다.";
    showScreen("doneScreen");
  }, 1200);
}

function simulateRequesterScan() {
  // QR 화면에서 헬퍼가 스캔했다고 가정하는 흐름
  showToast("QR이 인식되었습니다!");
  setTimeout(() => {
    showScreen("doneScreen");
  }, 800);
}

// =========================
// 마이페이지 / 상점 기능
// =========================

// 유저 정보 / 포인트 더미 데이터
let userInfo = {
  name: "홍길동",
  id: "user123",
  helpedCount: 12,
  requestedCount: 3,
  rating: 4.8,
  points: 2350,
  reviews: [
    "응답이 빨라서 좋았어요.",
    "역 도착 전에 미리 알려주셔서 감사했습니다.",
    "매너가 좋아서 안심됐습니다.",
  ],
};

// 상점 상품 더미 데이터
const shopItems = [
  {
    id: "shop1",
    name: "편의점 커피 쿠폰",
    point: 800,
    desc: "주요 편의점에서 사용 가능한 아메리카노 쿠폰",
  },
  {
    id: "shop2",
    name: "샌드위치 세트",
    point: 1500,
    desc: "출근길 간단한 아침 대용",
  },
  {
    id: "shop3",
    name: "치킨 기프티콘",
    point: 4500,
    desc: "친구와 함께 나눠 먹는 치킨 세트",
  },
  {
    id: "shop4",
    name: "모바일 배터리팩 할인권",
    point: 3000,
    desc: "제휴 온라인몰에서 사용 가능한 할인 쿠폰",
  },
];

// 홈 헤더 우측 상단 버튼에서 호출
function goToMyPage() {
  updateMyPageUI();
  showScreen("myPageScreen");
}

// 마이페이지 UI 갱신 (내 정보 + 포인트 요약 + 후기만)
function updateMyPageUI() {
  const nameEl = document.getElementById("mypageName");
  const idEl = document.getElementById("mypageId");
  const statsEl = document.getElementById("mypageStats");
  const pointEl = document.getElementById("mypagePointValue");
  const ratingEl = document.getElementById("mypageRating");
  const reviewListEl = document.getElementById("mypageReviewList");

  if (!nameEl) return; // 안전장치

  nameEl.innerText = userInfo.name;
  idEl.innerText = "@" + userInfo.id;
  statsEl.innerText =
    "도움 받은 " +
    userInfo.requestedCount +
    "회 · 도와준 " +
    userInfo.helpedCount +
    "회";

  pointEl.innerText = userInfo.points.toLocaleString() + " P";
  ratingEl.innerText = "★ " + userInfo.rating.toFixed(1);

  // 후기 리스트 갱신
  reviewListEl.innerHTML = "";
  userInfo.reviews.slice(0, 3).forEach((r) => {
    const li = document.createElement("li");
    li.innerText = "“" + r + "”";
    reviewListEl.appendChild(li);
  });
}

// 상점으로 이동
function goToShop() {
  updateShopUI();
  showScreen("shopScreen");
}

// 상점 UI 갱신 (포인트 + 상품 리스트)
function updateShopUI() {
  const pointEl = document.getElementById("shopPointValue");
  const gridEl = document.getElementById("shopGrid");
  if (!pointEl || !gridEl) return;

  pointEl.innerText = userInfo.points.toLocaleString() + " P";

  gridEl.innerHTML = "";
  shopItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "shop-item-card";

    const name = document.createElement("div");
    name.className = "shop-item-name";
    name.innerText = item.name;

    const pt = document.createElement("div");
    pt.className = "shop-item-point";
    pt.innerText = item.point.toLocaleString() + " P";

    const desc = document.createElement("div");
    desc.className = "shop-item-desc";
    desc.innerText = item.desc;

    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-small";
    btn.innerText = "교환하기";
    btn.onclick = () => redeemProduct(item.id);

    // 포인트 부족 시 비활성화
    if (userInfo.points < item.point) {
      btn.disabled = true;
      btn.innerText = "포인트 부족";
    }

    card.appendChild(name);
    card.appendChild(pt);
    card.appendChild(desc);
    card.appendChild(btn);

    gridEl.appendChild(card);
  });
}

// 상품 교환 (데모용)
function redeemProduct(itemId) {
  const item = shopItems.find((it) => it.id === itemId);
  if (!item) return;

  if (userInfo.points < item.point) {
    showToast("포인트가 부족합니다.");
    return;
  }

  userInfo.points -= item.point;

  showModal(
    item.name +
      " 상품을 " +
      item.point.toLocaleString() +
      "P로 교환했습니다.\n" +
      "실제 서비스에서는 쿠폰함에서 쿠폰을 확인할 수 있어요."
  );

  // 포인트가 바뀌었으므로 두 화면 모두 갱신
  updateMyPageUI();
  updateShopUI();
}

// 포인트 현금화 (데모용)
function openCashoutModal() {
  showModal(
    "현재 보유 포인트: " +
      userInfo.points.toLocaleString() +
      "P\n\n" +
      "데모 버전에서는 실제 출금 대신\n" +
      "현금화 요청 UI만 보여줍니다.\n" +
      "실제 서비스에서는 계좌 등록과 출금 내역 관리가 필요합니다."
  );
}

/* ===========================
   실제 카메라 켜기
   =========================== */

let cameraStream = null;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    document.getElementById("cameraStream").srcObject = stream;
  } catch (error) {
    alert("카메라 접근 권한이 필요합니다.");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
}

function goToHome() {
  showScreen("homeScreen");
}
/* ===========================
   나이 판정 더미 데이터
   =========================== */

// 테스트 때 여기 숫자만 바꾸면 됨
const fakeAge = 20; // 테스트용 나이

/* ==============================
   신분증 스캔용 FAB 버튼 로직
   ============================== */
const scanBtn = document.getElementById("scanBtn");

if (scanBtn) {
  let isScanning = false;

  scanBtn.addEventListener("click", () => {
    if (isScanning) return; // 중복 클릭 방지
    isScanning = true;
    scanBtn.classList.add("is-loading");

    // 사용자에게는 토스트나 alert로 "스캔 중" 보여주기
    // 프로젝트에 showToast 함수 있으면 그걸 쓰고,
    // 없으면 아래처럼 간단히 alert 대신 써도 됨.
    // showToast("신분증을 확인하는 중입니다...");
    console.log("신분증 스캔 중...");

    setTimeout(() => {
      scanBtn.classList.remove("is-loading");

      // ✅ 나이 판정
      if (fakeAge >= 19) {
        // 성공 시
        // showToast("신분증 인증이 완료되었습니다.");
        showModal(
          `신분증 인증이 완료되었습니다.<br>(${fakeAge}세), 남성, 홍길동`
        );

        stopCamera(); // 카메라 끄기
        goToHome(); // 홈 화면으로 이동
      } else {
        // 실패 시
        showModal("만 19세 이상만 이용할 수 있습니다.");

        // 여기서는 홈으로 이동하지 않고 인증 화면 그대로 두는 게 자연스러움
      }

      isScanning = false;
    }, 1500); // 1.5초 정도 '스캔 중' 연출
  });
}

/* ===========================
   페이지 로드시 카메라 자동 시작
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  // 1) 무조건 인증 화면이 첫 화면
  showScreen("initScreen");

  startCamera();
});

/* ==========================
     Custom Modal Control
========================== */
function showModal(message) {
  document.getElementById("modalMessage").innerHTML = message;
  document.getElementById("appModal").style.display = "flex";
}

document.getElementById("modalCloseBtn").addEventListener("click", () => {
  document.getElementById("appModal").style.display = "none";
});
