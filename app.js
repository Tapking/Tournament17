"use strict";

/* =========================================================
   سیستم مدیریت مسابقات مجتمع‌ها
   هماهنگ با index.html و style.css فعلی
   ========================================================= */


/* =========================================================
   تنظیمات
   ========================================================= */

const STORAGE_KEYS = {
    teams: "teams",
    players: "players",
    matches: "matches"
};


/* =========================================================
   داده‌های اصلی
   ========================================================= */

let teams = loadArray(STORAGE_KEYS.teams);
let players = loadArray(STORAGE_KEYS.players);
let matches = loadArray(STORAGE_KEYS.matches);


/* =========================================================
   ابزارهای عمومی
   ========================================================= */

function loadArray(key) {
    try {
        const raw = localStorage.getItem(key);

        if (!raw) {
            return [];
        }

        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("خطا در خواندن اطلاعات:", error);
        return [];
    }
}


function saveAll() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.teams,
            JSON.stringify(teams)
        );

        localStorage.setItem(
            STORAGE_KEYS.players,
            JSON.stringify(players)
        );

        localStorage.setItem(
            STORAGE_KEYS.matches,
            JSON.stringify(matches)
        );

        return true;

    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);

        showToast(
            "❌ ذخیره اطلاعات انجام نشد. ممکن است حافظه مرورگر پر شده باشد."
        );

        return false;
    }
}


function createId() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getTeam(teamId) {
    return teams.find(
        team => String(team.id) === String(teamId)
    );
}


function getDefaultPhoto() {
    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="200"
                 height="200"
                 viewBox="0 0 200 200">

                <rect
                    width="200"
                    height="200"
                    fill="#e5e7eb"
                />

                <circle
                    cx="100"
                    cy="75"
                    r="35"
                    fill="#9ca3af"
                />

                <path
                    d="M35 185
                       C45 130 155 130 165 185"
                    fill="#9ca3af"
                />
            </svg>
        `)
    );
}


/* =========================================================
   پیام Toast
   ========================================================= */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================================
   عکس
   ========================================================= */

function readImage(file, callback) {

    if (!file) {
        callback("");
        return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
        showToast("❌ لطفاً یک فایل تصویری انتخاب کنید.");
        callback("");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        callback(reader.result);
    };

    reader.onerror = () => {
        showToast("❌ خواندن عکس انجام نشد.");
        callback("");
    };

    reader.readAsDataURL(file);
}


/* =========================================================
   جابه‌جایی بخش‌ها
   ========================================================= */

function openSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {
            button.classList.remove("active");
        });

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    const navButton =
        document.querySelector(
            `.nav-btn[data-section="${sectionId}"]`
        );

    if (navButton) {
        navButton.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   منوی اصلی
   ========================================================= */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            openSection(
                button.dataset.section
            );

        });

    });


document
    .querySelectorAll("[data-go]")
    .forEach(button => {

        button.addEventListener("click", () => {

            openSection(
                button.dataset.go
            );

        });

    });


/* =========================================================
   آمار صفحه اصلی
   ========================================================= */

function updateStats() {

    const teamCount =
        document.getElementById("teamCount");

    const playerCount =
        document.getElementById("playerCount");

    const matchCount =
        document.getElementById("matchCount");

    const finishedCount =
        document.getElementById("finishedCount");


    if (teamCount) {
        teamCount.textContent = teams.length;
    }

    if (playerCount) {
        playerCount.textContent = players.length;
    }

    if (matchCount) {
        matchCount.textContent = matches.length;
    }

    if (finishedCount) {
        finishedCount.textContent =
            matches.filter(
                match => match.finished === true
            ).length;
    }
}


/* =========================================================
   فرم تیم
   ========================================================= */

const teamForm =
    document.getElementById("teamForm");


document
    .getElementById("openTeamForm")
    .addEventListener("click", () => {

        teamForm.classList.remove("hidden");

        document
            .getElementById("teamName")
            .focus();

    });


document
    .getElementById("cancelTeam")
    .addEventListener("click", () => {

        teamForm.classList.add("hidden");

        clearTeamForm();

    });


document
    .getElementById("saveTeam")
    .addEventListener("click", saveTeam);


function saveTeam() {

    const name =
        document
            .getElementById("teamName")
            .value
            .trim();

    const place =
        document
            .getElementById("teamPlace")
            .value
            .trim();

    const logoInput =
        document.getElementById("teamLogo");

    const file =
        logoInput.files[0];


    if (!name) {
        showToast("⚠️ نام تیم را وارد کنید.");
        return;
    }


    /* جلوگیری از نام تکراری */

    const duplicate =
        teams.some(
            team =>
                team.name.trim().toLowerCase() ===
                name.toLowerCase()
        );

    if (duplicate) {
        showToast("⚠️ این نام تیم قبلاً ثبت شده است.");
        return;
    }


    readImage(file, image => {

        const team = {
            id: createId(),
            name: name,
            place: place,
            logo: image || getDefaultPhoto()
        };


        teams.push(team);

        if (!saveAll()) {
            return;
        }

        renderAll();

        clearTeamForm();

        teamForm.classList.add("hidden");

        showToast("✅ تیم با موفقیت اضافه شد.");

    });
}


function clearTeamForm() {

    document.getElementById("teamName").value = "";

    document.getElementById("teamPlace").value = "";

    document.getElementById("teamLogo").value = "";
}


/* =========================================================
   نمایش تیم‌ها
   ========================================================= */

function renderTeams() {

    const container =
        document.getElementById("teamsList");

    if (!container) {
        return;
    }


    if (!teams.length) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز تیمی اضافه نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        teams.map(team => {

            const count =
                players.filter(
                    player =>
                        String(player.teamId) ===
                        String(team.id)
                ).length;


            return `
                <article class="team-card">

                    <img
                        class="team-logo"
                        src="${team.logo || getDefaultPhoto()}"
                        alt="لوگوی ${escapeHTML(team.name)}"
                    >

                    <h3>
                        ${escapeHTML(team.name)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            team.place || "بدون محل"
                        )}
                    </p>

                    <p>
                        👥 ${count} بازیکن
                    </p>

                    <div class="card-buttons">

                        <button
                            class="small-btn team-players-btn"
                            data-team-id="${escapeHTML(team.id)}"
                        >
                            👥 بازیکنان
                        </button>

                        <button
                            class="small-btn delete-btn team-delete-btn"
                            data-team-id="${escapeHTML(team.id)}"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </article>
            `;

        }).join("");


    container
        .querySelectorAll(".team-players-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showTeamPlayers(
                        button.dataset.teamId
                    );

                }
            );

        });


    container
        .querySelectorAll(".team-delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteTeam(
                        button.dataset.teamId
                    );

                }
            );

        });
}


/* =========================================================
   بازیکنان یک تیم
   ========================================================= */

function showTeamPlayers(teamId) {

    const filter =
        document.getElementById(
            "playerTeamFilter"
        );

    if (filter) {
        filter.value = teamId;
    }

    openSection("players");

    renderPlayers();
}


/* =========================================================
   حذف تیم
   ========================================================= */

function deleteTeam(teamId) {

    const team =
        getTeam(teamId);

    if (!team) {
        return;
    }


    const hasPlayers =
        players.some(
            player =>
                String(player.teamId) ===
                String(teamId)
        );


    const hasMatches =
        matches.some(
            match =>
                String(match.homeId) ===
                    String(teamId) ||
                String(match.awayId) ===
                    String(teamId)
        );


    if (hasPlayers || hasMatches) {

        showToast(
            "⚠️ ابتدا بازیکنان و مسابقات این تیم را حذف کنید."
        );

        return;
    }


    const answer =
        window.confirm(
            `تیم «${team.name}» حذف شود؟`
        );


    if (!answer) {
        return;
    }


    teams =
        teams.filter(
            item =>
                String(item.id) !==
                String(teamId)
        );


    saveAll();

    renderAll();

    showToast("🗑️ تیم حذف شد.");
}


/* =========================================================
   فرم بازیکن
   ========================================================= */

const playerForm =
    document.getElementById("playerForm");


document
    .getElementById("openPlayerForm")
    .addEventListener("click", () => {

        if (!teams.length) {

            showToast(
                "⚠️ ابتدا حداقل یک تیم بسازید."
            );

            openSection("teams");

            return;
        }

        updateTeamSelects();

        playerForm.classList.remove("hidden");

        document
            .getElementById("playerName")
            .focus();

    });


document
    .getElementById("cancelPlayer")
    .addEventListener("click", () => {

        playerForm.classList.add("hidden");

        clearPlayerForm();

    });


document
    .getElementById("savePlayer")
    .addEventListener("click", savePlayer);


document
    .getElementById("playerPhoto")
    .addEventListener(
        "change",
        previewPlayerPhoto
    );


function previewPlayerPhoto() {

    const input =
        document.getElementById("playerPhoto");

    const preview =
        document.getElementById(
            "playerPreview"
        );

    const file =
        input.files[0];


    if (!file) {

        preview.innerHTML = "";

        return;
    }


    if (!file.type.startsWith("image/")) {

        preview.innerHTML = "";

        showToast(
            "❌ فایل انتخاب‌شده عکس نیست."
        );

        input.value = "";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        preview.innerHTML = `
            <img
                src="${reader.result}"
                alt="پیش‌نمایش عکس"
            >
        `;

    };


    reader.readAsDataURL(file);
}


function savePlayer() {

    const name =
        document
            .getElementById("playerName")
            .value
            .trim();


    const teamId =
        document.getElementById(
            "playerTeam"
        ).value;


    const number =
        document.getElementById(
            "playerNumber"
        ).value;


    const position =
        document.getElementById(
            "playerPosition"
        ).value;


    const captain =
        document.getElementById(
            "playerCaptain"
        ).checked;


    const photoFile =
        document.getElementById(
            "playerPhoto"
        ).files[0];


    if (!name) {

        showToast(
            "⚠️ نام بازیکن را وارد کنید."
        );

        return;
    }


    if (!teamId) {

        showToast(
            "⚠️ تیم بازیکن را انتخاب کنید."
        );

        return;
    }


    const numberValue =
        number === ""
            ? "-"
            : String(number);


    readImage(
        photoFile,
        image => {

            /* فقط یک کاپیتان برای هر تیم */

            if (captain) {

                players
                    .filter(
                        player =>
                            String(
                                player.teamId
                            ) ===
                            String(teamId)
                    )
                    .forEach(player => {

                        player.captain = false;

                    });

            }


            players.push({

                id: createId(),

                name: name,

                teamId: teamId,

                number: numberValue,

                position:
                    position ||
                    "نامشخص",

                captain: captain,

                photo:
                    image ||
                    getDefaultPhoto()

            });


            if (!saveAll()) {
                return;
            }


            renderAll();

            clearPlayerForm();

            playerForm.classList.add(
                "hidden"
            );

            showToast(
                "✅ بازیکن با موفقیت اضافه شد."
            );

        }
    );
}


function clearPlayerForm() {

    document.getElementById(
        "playerName"
    ).value = "";


    document.getElementById(
        "playerTeam"
    ).value = "";


    document.getElementById(
        "playerNumber"
    ).value = "";


    document.getElementById(
        "playerPosition"
    ).value = "دروازه‌بان";


    document.getElementById(
        "playerCaptain"
    ).checked = false;


    document.getElementById(
        "playerPhoto"
    ).value = "";


    document.getElementById(
        "playerPreview"
    ).innerHTML = "";
}


/* =========================================================
   انتخاب تیم‌ها
   ========================================================= */

function updateTeamSelects() {

    const playerSelect =
        document.getElementById(
            "playerTeam"
        );


    const filter =
        document.getElementById(
            "playerTeamFilter"
        );


    const home =
        document.getElementById(
            "matchHome"
        );


    const away =
        document.getElementById(
            "matchAway"
        );


    const oldFilter =
        filter
            ? filter.value
            : "all";


    const options =
        teams
            .map(team => {

                return `
                    <option value="${escapeHTML(team.id)}">
                        ${escapeHTML(team.name)}
                    </option>
                `;

            })
            .join("");


    if (playerSelect) {

        playerSelect.innerHTML =
            `
                <option value="">
                    انتخاب تیم
                </option>
            ` +
            options;

    }


    if (filter) {

        filter.innerHTML =
            `
                <option value="all">
                    همه تیم‌ها
                </option>
            ` +
            options;


        const valid =
            [...filter.options].some(
                option =>
                    option.value ===
                    oldFilter
            );


        if (valid) {
            filter.value = oldFilter;
        }

    }


    if (home) {

        home.innerHTML =
            `
                <option value="">
                    انتخاب تیم
                </option>
            ` +
            options;

    }


    if (away) {

        away.innerHTML =
            `
                <option value="">
                    انتخاب تیم
                </option>
            ` +
            options;

    }
}


/* =========================================================
   فیلتر و جستجوی بازیکنان
   ========================================================= */

document
    .getElementById("playerTeamFilter")
    .addEventListener(
        "change",
        renderPlayers
    );


document
    .getElementById("playerSearch")
    .addEventListener(
        "input",
        renderPlayers
    );


function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        );


    if (!container) {
        return;
    }


    const filter =
        document.getElementById(
            "playerTeamFilter"
        ).value;


    const search =
        document.getElementById(
            "playerSearch"
        ).value
            .trim()
            .toLowerCase();


    const filtered =
        players.filter(player => {

            const teamMatch =
                filter === "all" ||
                String(player.teamId) ===
                    String(filter);


            const playerName =
                String(
                    player.name || ""
                ).toLowerCase();


            const searchMatch =
                playerName.includes(search);


            return (
                teamMatch &&
                searchMatch
            );

        });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                بازیکنی پیدا نشد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(player => {

                const team =
                    getTeam(
                        player.teamId
                    );


                return `
                    <article
                        class="player-card"
                    >

                        <div
                            class="jersey-number"
                        >
                            ${escapeHTML(
                                player.number || "-"
                            )}
                        </div>


                        <img
                            class="player-photo"
                            src="${
                                player.photo ||
                                getDefaultPhoto()
                            }"
                            alt="${escapeHTML(
                                player.name
                            )}"
                        >


                        <h3>
                            ${escapeHTML(
                                player.name
                            )}
                        </h3>


                        ${
                            player.captain
                                ? `
                                    <span class="captain">
                                        🧑‍✈️ کاپیتان
                                    </span>
                                `
                                : ""
                        }


                        <div class="player-info">

                            👕
                            ${escapeHTML(
                                team
                                    ? team.name
                                    : "بدون تیم"
                            )}

                            <br>

                            ⚽
                            ${escapeHTML(
                                player.position ||
                                "نامشخص"
                            )}

                        </div>


                        <div class="card-buttons">

                            <button
                                class="small-btn delete-btn player-delete-btn"
                                data-player-id="${escapeHTML(
                                    player.id
                                )}"
                            >
                                🗑️ حذف
                            </button>

                        </div>

                    </article>
                `;

            })
            .join("");


    container
        .querySelectorAll(
            ".player-delete-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deletePlayer(
                        button.dataset.playerId
                    );

                }
            );

        });
}


/* =========================================================
   حذف بازیکن
   ========================================================= */

function deletePlayer(playerId) {

    const player =
        players.find(
            item =>
                String(item.id) ===
                String(playerId)
        );


    if (!player) {
        return;
    }


    const answer =
        window.confirm(
            `بازیکن «${player.name}» حذف شود؟`
        );


    if (!answer) {
        return;
    }


    players =
        players.filter(
            item =>
                String(item.id) !==
                String(playerId)
        );


    saveAll();

    renderAll();

    showToast("🗑️ بازیکن حذف شد.");
}


/* =========================================================
   مسابقات
   ========================================================= */

const matchForm =
    document.getElementById(
        "matchForm"
    );


document
    .getElementById("openMatchForm")
    .addEventListener("click", () => {

        if (teams.length < 2) {

            showToast(
                "⚠️ برای مسابقه حداقل دو تیم لازم است."
            );

            openSection("teams");

            return;
        }


        updateTeamSelects();

        matchForm.classList.remove(
            "hidden"
        );

    });


document
    .getElementById("cancelMatch")
    .addEventListener("click", () => {

        matchForm.classList.add(
            "hidden"
        );

        clearMatchForm();

    });


document
    .getElementById("saveMatch")
    .addEventListener(
        "click",
        saveMatch
    );


function saveMatch() {

    const homeId =
        document.getElementById(
            "matchHome"
        ).value;


    const awayId =
        document.getElementById(
            "matchAway"
        ).value;


    const homeScore =
        Number(
            document.getElementById(
                "homeScore"
            ).value
        );


    const awayScore =
        Number(
            document.getElementById(
                "awayScore"
            ).value
        );


    const date =
        document.getElementById(
            "matchDate"
        ).value;


    const finished =
        document.getElementById(
            "matchFinished"
        ).checked;


    if (!homeId || !awayId) {

        showToast(
            "⚠️ هر دو تیم را انتخاب کنید."
        );

        return;
    }


    if (homeId === awayId) {

        showToast(
            "⚠️ یک تیم نمی‌تواند با خودش بازی کند."
        );

        return;
    }


    if (
        !Number.isInteger(homeScore) ||
        !Number.isInteger(awayScore) ||
        homeScore < 0 ||
        awayScore < 0
    ) {

        showToast(
            "⚠️ نتیجه مسابقه صحیح نیست."
        );

        return;
    }


    const match = {

        id: createId(),

        homeId: homeId,

        awayId: awayId,

        homeScore: homeScore,

        awayScore: awayScore,

        date:
            date ||
            new Date()
                .toISOString()
                .slice(0, 10),

        finished:
            finished === true

    };


    matches.push(match);


    if (!saveAll()) {
        return;
    }


    renderAll();

    clearMatchForm();

    matchForm.classList.add(
        "hidden"
    );


    showToast(
        "✅ مسابقه با موفقیت ثبت شد."
    );
}


function clearMatchForm() {

    document.getElementById(
        "matchHome"
    ).value = "";


    document.getElementById(
        "matchAway"
    ).value = "";


    document.getElementById(
        "homeScore"
    ).value = "0";


    document.getElementById(
        "awayScore"
    ).value = "0";


    document.getElementById(
        "matchDate"
    ).value = "";


    document.getElementById(
        "matchFinished"
    ).checked = true;
}


/* =========================================================
   نمایش مسابقات
   ========================================================= */

function renderMatches() {

    const container =
        document.getElementById(
            "matchesList"
        );


    if (!container) {
        return;
    }


    if (!matches.length) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز مسابقه‌ای ثبت نشده است.
            </div>
        `;

        return;
    }


    const sortedMatches =
        [...matches].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.date || 0
                    ).getTime();

                return dateB - dateA;

            }
        );


    container.innerHTML =
        sortedMatches
            .map(match => {

                const home =
                    getTeam(
                        match.homeId
                    );


                const away =
                    getTeam(
                        match.awayId
                    );


                return `
                    <article
                        class="match-card"
                    >

                        <div
                            class="match-teams"
                        >

                            <strong>
                                ${escapeHTML(
                                    home
                                        ? home.name
                                        : "تیم حذف‌شده"
                                )}
                            </strong>


                            <div
                                class="match-score"
                            >
                                ${
                                    match.finished
                                        ? `${Number(
                                            match.homeScore
                                          )} - ${Number(
                                            match.awayScore
                                          )}`
                                        : "VS"
                                }
                            </div>


                            <strong>
                                ${escapeHTML(
                                    away
                                        ? away.name
                                        : "تیم حذف‌شده"
                                )}
                            </strong>

                        </div>


                        <div
                            class="match-date"
                        >
                            📅
                            ${escapeHTML(
                                match.date ||
                                "بدون تاریخ"
                            )}
                        </div>


                        <div
                            class="card-buttons"
                        >

                            <button
                                class="small-btn delete-btn match-delete-btn"
                                data-match-id="${escapeHTML(
                                    match.id
                                )}"
                            >
                                🗑️ حذف مسابقه
                            </button>

                        </div>

                    </article>
                `;

            })
            .join("");


    container
        .querySelectorAll(
            ".match-delete-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteMatch(
                        button.dataset.matchId
                    );

                }
            );

        });
}


/* =========================================================
   حذف مسابقه
   ========================================================= */

function deleteMatch(matchId) {

    const match =
        matches.find(
            item =>
                String(item.id) ===
                String(matchId)
        );


    if (!match) {
        return;
    }


    const answer =
        window.confirm(
            "این مسابقه حذف شود؟"
        );


    if (!answer) {
        return;
    }


    matches =
        matches.filter(
            item =>
                String(item.id) !==
                String(matchId)
        );


    saveAll();

    renderAll();

    showToast(
        "🗑️ مسابقه حذف شد."
    );
}


/* =========================================================
   محاسبه جدول
   ========================================================= */

function calculateStandings() {

    const table = {};


    teams.forEach(team => {

        table[team.id] = {

            id: team.id,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            points: 0

        };

    });


    matches
        .filter(
            match =>
                match.finished === true
        )
        .forEach(match => {

            const home =
                table[match.homeId];

            const away =
                table[match.awayId];


            if (!home || !away) {
                return;
            }


            const homeScore =
                Number(match.homeScore);


            const awayScore =
                Number(match.awayScore);


            if (
                !Number.isFinite(homeScore) ||
                !Number.isFinite(awayScore)
            ) {
                return;
            }


            home.played++;

            away.played++;


            home.goalsFor +=
                homeScore;

            home.goalsAgainst +=
                awayScore;


            away.goalsFor +=
                awayScore;

            away.goalsAgainst +=
                homeScore;


            if (
                homeScore >
                awayScore
            ) {

                home.wins++;

                away.losses++;

                home.points += 3;

            } else if (
                homeScore <
                awayScore
            ) {

                away.wins++;

                home.losses++;

                away.points += 3;

            } else {

                home.draws++;

                away.draws++;

                home.points++;

                away.points++;

            }

        });


    return Object.values(table)
        .sort((a, b) => {

            /* امتیاز */

            if (
                b.points !==
                a.points
            ) {
                return (
                    b.points -
                    a.points
                );
            }


            /* تفاضل گل */

            const diffA =
                a.goalsFor -
                a.goalsAgainst;


            const diffB =
                b.goalsFor -
                b.goalsAgainst;


            if (
                diffB !==
                diffA
            ) {

                return (
                    diffB -
                    diffA
                );

            }


            /* گل زده */

            if (
                b.goalsFor !==
                a.goalsFor
            ) {

                return (
                    b.goalsFor -
                    a.goalsFor
                );

            }


            /* نام تیم */

            const teamA =
                getTeam(a.id);

            const teamB =
                getTeam(b.id);


            return String(
                teamA
                    ? teamA.name
                    : ""
            ).localeCompare(
                String(
                    teamB
                        ? teamB.name
                        : ""
                ),
                "fa"
            );

        });
}


/* =========================================================
   نمایش جدول
   ========================================================= */

function renderTable() {

    const body =
        document.getElementById(
            "standingsBody"
        );


    if (!body) {
        return;
    }


    const standings =
        calculateStandings();


    if (!standings.length) {

        body.innerHTML = `
            <tr>
                <td colspan="8">
                    هنوز تیمی ثبت نشده است.
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        standings
            .map(
                (item, index) => {

                    const team =
                        getTeam(item.id);


                    const logo =
                        team &&
                        team.logo
                            ? team.logo
                            : getDefaultPhoto();


                    const name =
                        team
                            ? team.name
                            : "تیم حذف‌شده";


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>
                                <div
                                    class="team-cell"
                                >

                                    <img
                                        class="table-logo"
                                        src="${logo}"
                                        alt=""
                                    >

                                    <strong>
                                        ${escapeHTML(
                                            name
                                        )}
                                    </strong>

                                </div>
                            </td>


                            <td>
                                ${item.played}
                            </td>


                            <td>
                                ${item.wins}
                            </td>


                            <td>
                                ${item.draws}
                            </td>


                            <td>
                                ${item.losses}
                            </td>


                            <td>
                                ${item.goalsFor}
                                :
                                ${item.goalsAgainst}
                            </td>


                            <td>
                                <strong>
                                    ${item.points}
                                </strong>
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");
}


/* =========================================================
   خروجی اطلاعات
   ========================================================= */

document
    .getElementById("exportData")
    .addEventListener(
        "click",
        exportData
    );


function exportData() {

    const data = {

        version: 2,

        exportedAt:
            new Date().toISOString(),

        teams: teams,

        players: players,

        matches: matches

    };


    try {

        const json =
            JSON.stringify(
                data,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            "tournament-backup.json";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 500);


        showToast(
            "📦 فایل پشتیبان آماده شد."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "❌ ساخت فایل پشتیبان انجام نشد."
        );

    }
}


/* =========================================================
   وارد کردن اطلاعات
   ========================================================= */

document
    .getElementById("importData")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "importFile"
                )
                .click();

        }
    );


document
    .getElementById("importFile")
    .addEventListener(
        "change",
        importData
    );


function importData(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        try {

            const data =
                JSON.parse(
                    reader.result
                );


            if (
                !data ||
                !Array.isArray(
                    data.teams
                ) ||
                !Array.isArray(
                    data.players
                ) ||
                !Array.isArray(
                    data.matches
                )
            ) {

                throw new Error(
                    "INVALID_BACKUP"
                );

            }


            const answer =
                window.confirm(
                    "اطلاعات فعلی با اطلاعات فایل جایگزین شود؟"
                );


            if (!answer) {
                event.target.value = "";
                return;
            }


            teams =
                data.teams.map(
                    team => ({
                        id:
                            team.id ||
                            createId(),

                        name:
                            String(
                                team.name ||
                                "تیم بدون نام"
                            ),

                        place:
                            String(
                                team.place ||
                                ""
                            ),

                        logo:
                            team.logo ||
                            getDefaultPhoto()
                    })
                );


            players =
                data.players.map(
                    player => ({
                        id:
                            player.id ||
                            createId(),

                        name:
                            String(
                                player.name ||
                                "بازیکن بدون نام"
                            ),

                        teamId:
                            player.teamId ||
                            "",

                        number:
                            player.number ??
                            "-",

                        position:
                            player.position ||
                            "نامشخص",

                        captain:
                            player.captain ===
                            true,

                        photo:
                            player.photo ||
                            getDefaultPhoto()
                    })
                );


            matches =
                data.matches.map(
                    match => ({
                        id:
                            match.id ||
                            createId(),

                        homeId:
                            match.homeId ||
                            "",

                        awayId:
                            match.awayId ||
                            "",

                        homeScore:
                            Number(
                                match.homeScore
                            ) || 0,

                        awayScore:
                            Number(
                                match.awayScore
                            ) || 0,

                        date:
                            match.date ||
                            "",

                        finished:
                            match.finished ===
                            true
                    })
                );


            if (!saveAll()) {
                return;
            }


            renderAll();


            showToast(
                "✅ اطلاعات با موفقیت وارد شد."
            );


        } catch (error) {

            console.error(
                "Import error:",
                error
            );


            showToast(
                "❌ فایل پشتیبان معتبر نیست."
            );

        }


        event.target.value = "";

    };


    reader.onerror = () => {

        showToast(
            "❌ خواندن فایل انجام نشد."
        );

        event.target.value = "";

    };


    reader.readAsText(
        file,
        "UTF-8"
    );
}


/* =========================================================
   حذف همه اطلاعات
   ========================================================= */

document
    .getElementById("clearData")
    .addEventListener(
        "click",
        clearEverything
    );


function clearEverything() {

    if (
        !teams.length &&
        !players.length &&
        !matches.length
    ) {

        showToast(
            "ℹ️ اطلاعاتی برای حذف وجود ندارد."
        );

        return;
    }


    const answer =
        window.confirm(
            "⚠️ همه تیم‌ها، بازیکنان و مسابقات حذف شوند؟"
        );


    if (!answer) {
        return;
    }


    teams = [];

    players = [];

    matches = [];


    saveAll();

    renderAll();


    showToast(
        "🗑️ تمام اطلاعات حذف شد."
    );
}


/* =========================================================
   وضعیت اینترنت
   ========================================================= */

function updateConnection() {

    const dot =
        document.getElementById(
            "connectionDot"
        );


    const text =
        document.getElementById(
            "connectionText"
        );


    if (!dot || !text) {
        return;
    }


    if (navigator.onLine) {

        dot.style.background =
            "#22c55e";

        text.textContent =
            "آنلاین";

    } else {

        dot.style.background =
            "#ef4444";

        text.textContent =
            "آفلاین";

    }
}


window.addEventListener(
    "online",
    updateConnection
);


window.addEventListener(
    "offline",
    updateConnection
);


/* =========================================================
   رندر کامل برنامه
   ========================================================= */

function renderAll() {

    updateStats();

    updateTeamSelects();

    renderTeams();

    renderPlayers();

    renderMatches();

    renderTable();

    updateConnection();
}


/* =========================================================
   شروع برنامه
   ========================================================= */

renderAll();
/* =========================
   چاپ اطلاعات
========================= */

const printButton =
    document.getElementById("printData");

if (printButton) {

    printButton.addEventListener(
        "click",
        printTournament
    );

}

function printTournament() {

    // قبل از چاپ، همه اطلاعات را تازه می‌کنیم
    renderAll();

    showToast(
        "🖨️ آماده‌سازی برای چاپ..."
    );

    setTimeout(() => {

        window.print();

    }, 300);
}
