"use strict";

/* =========================
   اطلاعات اصلی
========================= */

let teams = loadData("teams", []);
let players = loadData("players", []);
let matches = loadData("matches", []);


/* =========================
   ذخیره و بازیابی
========================= */

function loadData(key, fallback) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : fallback;

    } catch (error) {

        console.error(error);

        return fallback;
    }
}


function saveAll() {

    localStorage.setItem(
        "teams",
        JSON.stringify(teams)
    );

    localStorage.setItem(
        "players",
        JSON.stringify(players)
    );

    localStorage.setItem(
        "matches",
        JSON.stringify(matches)
    );
}


/* =========================
   ابزارها
========================= */

function createId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
}


function getTeam(teamId) {

    return teams.find(
        team => team.id === teamId
    );
}


function getDefaultPhoto() {

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="200"
                 height="200">
                <rect width="100%" height="100%"
                      fill="#e5e7eb"/>
                <circle cx="100" cy="75" r="35"
                        fill="#9ca3af"/>
                <path d="M35 185
                         C45 130 155 130 165 185"
                      fill="#9ca3af"/>
            </svg>
        `);
}


/* =========================
   تبدیل عکس به Data URL
========================= */

function readImage(file, callback) {

    if (!file) {

        callback("");

        return;
    }

    if (!file.type.startsWith("image/")) {

        showToast(
            "لطفاً یک فایل تصویری انتخاب کنید."
        );

        callback("");

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        callback(reader.result);

    };

    reader.onerror = function () {

        showToast(
            "خواندن عکس انجام نشد."
        );

        callback("");

    };

    reader.readAsDataURL(file);
}


/* =========================
   جابه‌جایی بخش‌ها
========================= */

function openSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });

    const section =
        document.getElementById(
            sectionId
        );

    if (section) {

        section.classList.add("active");

    }

    const nav =
        document.querySelector(
            `.nav-btn[data-section="${sectionId}"]`
        );

    if (nav) {

        nav.classList.add("active");

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   منوی اصلی
========================= */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openSection(
                    button.dataset.section
                );

            }
        );

    });


document
    .querySelectorAll("[data-go]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openSection(
                    button.dataset.go
                );

            }
        );

    });


/* =========================
   تعدادها
========================= */

function updateStats() {

    document.getElementById(
        "teamCount"
    ).textContent = teams.length;

    document.getElementById(
        "playerCount"
    ).textContent = players.length;

    document.getElementById(
        "matchCount"
    ).textContent = matches.length;

    document.getElementById(
        "finishedCount"
    ).textContent =
        matches.filter(
            match => match.finished
        ).length;
}


/* =========================
   فرم تیم
========================= */

const teamForm =
    document.getElementById(
        "teamForm"
    );

document
    .getElementById("openTeamForm")
    .addEventListener(
        "click",
        () => {

            teamForm.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("cancelTeam")
    .addEventListener(
        "click",
        () => {

            teamForm.classList.add(
                "hidden"
            );

            clearTeamForm();

        }
    );


document
    .getElementById("saveTeam")
    .addEventListener(
        "click",
        saveTeam
    );


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
        document.getElementById(
            "teamLogo"
        );

    if (!name) {

        showToast(
            "نام تیم را وارد کنید."
        );

        return;
    }

    const file =
        logoInput.files[0];

    readImage(
        file,
        image => {

            teams.push({

                id: createId(),

                name: name,

                place: place,

                logo:
                    image ||
                    getDefaultPhoto()

            });

            saveAll();

            renderAll();

            clearTeamForm();

            teamForm.classList.add(
                "hidden"
            );

            showToast(
                "✅ تیم با موفقیت اضافه شد."
            );

        }
    );
}


function clearTeamForm() {

    document.getElementById(
        "teamName"
    ).value = "";

    document.getElementById(
        "teamPlace"
    ).value = "";

    document.getElementById(
        "teamLogo"
    ).value = "";
}


/* =========================
   نمایش تیم‌ها
========================= */

function renderTeams() {

    const container =
        document.getElementById(
            "teamsList"
        );

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
                        player.teamId === team.id
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
                            class="small-btn"
                            onclick="showTeamPlayers('${team.id}')"
                        >
                            👥 بازیکنان
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteTeam('${team.id}')"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


function showTeamPlayers(teamId) {

    document.getElementById(
        "playerTeamFilter"
    ).value = teamId;

    openSection("players");

    renderPlayers();
}


function deleteTeam(teamId) {

    const hasPlayers =
        players.some(
            player =>
                player.teamId === teamId
        );

    const hasMatches =
        matches.some(
            match =>
                match.homeId === teamId ||
                match.awayId === teamId
        );

    if (hasPlayers || hasMatches) {

        showToast(
            "ابتدا بازیکنان و مسابقات این تیم را حذف کنید."
        );

        return;
    }

    teams =
        teams.filter(
            team =>
                team.id !== teamId
        );

    saveAll();

    renderAll();

    showToast(
        "تیم حذف شد."
    );
}


/* =========================
   فرم بازیکن
========================= */

const playerForm =
    document.getElementById(
        "playerForm"
    );


document
    .getElementById("openPlayerForm")
    .addEventListener(
        "click",
        () => {

            if (!teams.length) {

                showToast(
                    "ابتدا حداقل یک تیم بسازید."
                );

                openSection("teams");

                return;
            }

            updateTeamSelects();

            playerForm.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("cancelPlayer")
    .addEventListener(
        "click",
        () => {

            playerForm.classList.add(
                "hidden"
            );

            clearPlayerForm();

        }
    );


document
    .getElementById("savePlayer")
    .addEventListener(
        "click",
        savePlayer
    );


document
    .getElementById("playerPhoto")
    .addEventListener(
        "change",
        previewPlayerPhoto
    );


function previewPlayerPhoto() {

    const file =
        document.getElementById(
            "playerPhoto"
        ).files[0];

    const preview =
        document.getElementById(
            "playerPreview"
        );

    if (!file) {

        preview.innerHTML = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

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
            "نام بازیکن را وارد کنید."
        );

        return;
    }

    if (!teamId) {

        showToast(
            "تیم بازیکن را انتخاب کنید."
        );

        return;
    }


    readImage(
        photoFile,
        image => {

            if (captain) {

                players
                    .filter(
                        player =>
                            player.teamId === teamId
                    )
                    .forEach(
                        player =>
                            player.captain = false
                    );

            }


            players.push({

                id: createId(),

                name: name,

                teamId: teamId,

                number:
                    number || "-",

                position: position,

                captain: captain,

                photo:
                    image ||
                    getDefaultPhoto()

            });


            saveAll();

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


/* =========================
   انتخاب تیم‌ها
========================= */

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


    const options =
        teams.map(team => {

            return `
                <option value="${team.id}">
                    ${escapeHTML(team.name)}
                </option>
            `;

        }).join("");


    playerSelect.innerHTML =
        `<option value="">انتخاب تیم</option>` +
        options;


    const currentFilter =
        filter.value || "all";

    filter.innerHTML =
        `
            <option value="all">
                همه تیم‌ها
            </option>
        ` +
        options;

    if (
        [...filter.options]
            .some(
                option =>
                    option.value ===
                    currentFilter
            )
    ) {

        filter.value = currentFilter;

    }


    home.innerHTML =
        `<option value="">انتخاب تیم</option>` +
        options;


    away.innerHTML =
        `<option value="">انتخاب تیم</option>` +
        options;
}


/* =========================
   نمایش بازیکنان
========================= */

document
    .getElementById(
        "playerTeamFilter"
    )
    .addEventListener(
        "change",
        renderPlayers
    );


document
    .getElementById(
        "playerSearch"
    )
    .addEventListener(
        "input",
        renderPlayers
    );


function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        );

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
                player.teamId === filter;

            const searchMatch =
                player.name
                    .toLowerCase()
                    .includes(search);

            return teamMatch &&
                searchMatch;

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
        filtered.map(player => {

            const team =
                getTeam(player.teamId);

            return `
                <article class="player-card">

                    <div class="jersey-number">
                        ${escapeHTML(player.number)}
                    </div>

                    <img
                        class="player-photo"
                        src="${player.photo || getDefaultPhoto()}"
                        alt="${escapeHTML(player.name)}"
                    >

                    <h3>
                        ${escapeHTML(player.name)}
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
                            player.position
                        )}

                    </div>

                    <div class="card-buttons">

                        <button
                            class="small-btn delete-btn"
                            onclick="deletePlayer('${player.id}')"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


function deletePlayer(playerId) {

    players =
        players.filter(
            player =>
                player.id !== playerId
        );

    saveAll();

    renderAll();

    showToast(
        "بازیکن حذف شد."
    );
}


/* =========================
   مسابقات
========================= */

const matchForm =
    document.getElementById(
        "matchForm"
    );


document
    .getElementById("openMatchForm")
    .addEventListener(
        "click",
        () => {

            if (teams.length < 2) {

                showToast(
                    "برای مسابقه حداقل دو تیم لازم است."
                );

                openSection("teams");

                return;
            }

            updateTeamSelects();

            matchForm.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("cancelMatch")
    .addEventListener(
        "click",
        () => {

            matchForm.classList.add(
                "hidden"
            );

            clearMatchForm();

        }
    );


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
            "هر دو تیم را انتخاب کنید."
        );

        return;
    }

    if (homeId === awayId) {

        showToast(
            "یک تیم نمی‌تواند با خودش بازی کند."
        );

        return;
    }

    if (
        !Number.isFinite(homeScore) ||
        !Number.isFinite(awayScore) ||
        homeScore < 0 ||
        awayScore < 0
    ) {

        showToast(
            "نتیجه مسابقه صحیح نیست."
        );

        return;
    }


    matches.push({

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

        finished: finished

    });


    saveAll();

    renderAll();

    clearMatchForm();

    matchForm.classList.add(
        "hidden"
    );

    showToast(
        "✅ مسابقه ثبت شد."
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


/* =========================
   نمایش مسابقات
========================= */

function renderMatches() {

    const container =
        document.getElementById(
            "matchesList"
        );

    if (!matches.length) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز مسابقه‌ای ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        [...matches]
            .reverse()
            .map(match => {

                const home =
                    getTeam(match.homeId);

                const away =
                    getTeam(match.awayId);

                return `
                    <article class="match-card">

                        <div class="match-teams">

                            <strong>
                                ${
                                    escapeHTML(
                                        home
                                            ? home.name
                                            : "تیم حذف‌شده"
                                    )
                                }
                            </strong>

                            <div class="match-score">

                                ${
                                    match.finished
                                    ? `${match.homeScore} - ${match.awayScore}`
                                    : "VS"
                                }

                            </div>

                            <strong>
                                ${
                                    escapeHTML(
                                        away
                                            ? away.name
                                            : "تیم حذف‌شده"
                                    )
                                }
                            </strong>

                        </div>

                        <div class="match-date">
                            📅 ${escapeHTML(match.date)}
                        </div>

                        <div class="card-buttons">

                            <button
                                class="small-btn delete-btn"
                                onclick="deleteMatch('${match.id}')"
                            >
                                🗑️ حذف مسابقه
                            </button>

                        </div>

                    </article>
                `;

            })
            .join("");
}


function deleteMatch(matchId) {

    matches =
        matches.filter(
            match =>
                match.id !== matchId
        );

    saveAll();

    renderAll();

    showToast(
        "مسابقه حذف شد."
    );
}


/* =========================
   جدول
========================= */

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
                match.finished
        )
        .forEach(match => {

            const home =
                table[match.homeId];

            const away =
                table[match.awayId];

            if (!home || !away) {
                return;
            }


            home.played++;
            away.played++;


            home.goalsFor +=
                match.homeScore;

            home.goalsAgainst +=
                match.awayScore;


            away.goalsFor +=
                match.awayScore;

            away.goalsAgainst +=
                match.homeScore;


            if (
                match.homeScore >
                match.awayScore
            ) {

                home.wins++;

                away.losses++;

                home.points += 3;

            } else if (
                match.homeScore <
                match.awayScore
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

            if (
                b.points !== a.points
            ) {

                return b.points -
                    a.points;

            }

            const diffA =
                a.goalsFor -
                a.goalsAgainst;

            const diffB =
                b.goalsFor -
                b.goalsAgainst;

            if (diffB !== diffA) {

                return diffB -
                    diffA;

            }

            return b.goalsFor -
                a.goalsFor;

        });
}


function renderTable() {

    const body =
        document.getElementById(
            "standingsBody"
        );

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
            .map((item, index) => {

                const team =
                    getTeam(item.id);

                const logo =
                    team
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
                            <div class="team-cell">

                                <img
                                    class="table-logo"
                                    src="${logo}"
                                    alt=""
                                >

                                <strong>
                                    ${escapeHTML(name)}
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
                            ${item.goalsFor} :
                            ${item.goalsAgainst}
                        </td>

                        <td>
                            <strong>
                                ${item.points}
                            </strong>
                        </td>

                    </tr>
                `;

            })
            .join("");
}


/* =========================
   خروجی اطلاعات
========================= */

document
    .getElementById("exportData")
    .addEventListener(
        "click",
        exportData
    );


function exportData() {

    const data = {

        version: 1,

        teams: teams,

        players: players,

        matches: matches

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "tournament-backup.json";

    link.click();

    URL.revokeObjectURL(url);


    showToast(
        "📦 فایل پشتیبان ساخته شد."
    );
}


/* =========================
   ورود اطلاعات
========================= */

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


    reader.onload =
        function () {

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
                        "invalid"
                    );

                }


                teams = data.teams;

                players = data.players;

                matches = data.matches;


                saveAll();

                renderAll();


                showToast(
                    "✅ اطلاعات با موفقیت وارد شد."
                );

            } catch (error) {

                showToast(
                    "❌ فایل پشتیبان معتبر نیست."
                );

            }

            event.target.value = "";

        };


    reader.readAsText(file);
}


/* =========================
   حذف تمام اطلاعات
========================= */

document
    .getElementById("clearData")
    .addEventListener(
        "click",
        clearEverything
    );


function clearEverything() {

    const answer =
        window.confirm(
            "همه تیم‌ها، بازیکنان و مسابقات حذف شوند؟"
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


/* =========================
   وضعیت اینترنت
========================= */

function updateConnection() {

    const online =
        navigator.onLine;

    const dot =
        document.getElementById(
            "connectionDot"
        );

    const text =
        document.getElementById(
            "connectionText"
        );


    if (online) {

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


/* =========================
   رندر کامل
========================= */

function renderAll() {

    updateStats();

    updateTeamSelects();

    renderTeams();

    renderPlayers();

    renderMatches();

    renderTable();

    updateConnection();
}


/* =========================
   شروع برنامه
========================= */

renderAll();
