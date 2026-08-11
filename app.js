/* =========================================================
   DATABASE
========================================================= */

const STORAGE_KEY = "communityTournamentData_v1";


let data = loadData();


function defaultData() {

    return {
        teams: [],
        players: [],
        matches: [],
        news: []
    };

}


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultData();
        }

        const parsed =
            JSON.parse(saved);

        return {
            teams: Array.isArray(parsed.teams)
                ? parsed.teams
                : [],

            players: Array.isArray(parsed.players)
                ? parsed.players
                : [],

            matches: Array.isArray(parsed.matches)
                ? parsed.matches
                : [],

            news: Array.isArray(parsed.news)
                ? parsed.news
                : []
        };

    } catch (error) {

        console.error(error);

        return defaultData();

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


function generateId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getTeam(teamId) {

    return data.teams.find(
        team => team.id === teamId
    );

}


function getPlayer(playerId) {

    return data.players.find(
        player => player.id === playerId
    );

}


function getTeamName(teamId) {

    const team =
        getTeam(teamId);

    return team
        ? team.name
        : "تیم حذف‌شده";

}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date + "T00:00:00")
        .toLocaleDateString("fa-IR");
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================================
   NAVIGATION
========================================================= */

function toggleMenu() {

    document
        .getElementById("mainMenu")
        .classList.toggle("open");

}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }


    document
        .getElementById("mainMenu")
        .classList.remove("open");


    if (pageId === "teams") {
        renderTeams();
    }

    if (pageId === "players") {
        renderPlayerFilters();
        renderPlayers();
    }

    if (pageId === "matches") {
        renderMatches();
    }

    if (pageId === "table") {
        renderStandings();
    }

    if (pageId === "stats") {
        renderPlayerStats();
    }

    if (pageId === "results") {
        renderResults();
    }

    if (pageId === "news") {
        renderNews();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   IMAGE
========================================================= */

function readImage(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            resolve("");
            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {

            resolve(reader.result);

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}


/* =========================================================
   TEAMS
========================================================= */

function openTeamForm(teamId = "") {

    const modal =
        document.getElementById("teamModal");

    const title =
        document.getElementById("teamModalTitle");


    document
        .getElementById("teamId")
        .value = teamId;


    document
        .getElementById("teamImage")
        .value = "";


    if (teamId) {

        const team =
            getTeam(teamId);

        if (!team) return;

        title.textContent =
            "✏️ ویرایش تیم";

        document
            .getElementById("teamName")
            .value = team.name;

        document
            .getElementById("teamColor")
            .value =
                team.color || "#2563eb";


        const preview =
            document
                .getElementById("teamImagePreview");


        if (team.image) {

            preview.src =
                team.image;

            preview.classList.remove("hidden");

        } else {

            preview.classList.add("hidden");

        }

    } else {

        title.textContent =
            "➕ افزودن تیم";

        document
            .getElementById("teamName")
            .value = "";

        document
            .getElementById("teamColor")
            .value = "#2563eb";

        document
            .getElementById("teamImagePreview")
            .classList.add("hidden");

    }


    modal.classList.add("show");

}


async function saveTeam(event) {

    event.preventDefault();


    const id =
        document.getElementById("teamId").value;


    const name =
        document
            .getElementById("teamName")
            .value
            .trim();


    const color =
        document
            .getElementById("teamColor")
            .value;


    const imageFile =
        document
            .getElementById("teamImage")
            .files[0];


    if (!name) {
        return;
    }


    let image = "";


    if (id) {

        const oldTeam =
            getTeam(id);

        image =
            oldTeam
                ? oldTeam.image || ""
                : "";

    }


    if (imageFile) {

        image =
            await readImage(imageFile);

    }


    if (id) {

        const team =
            getTeam(id);

        team.name = name;
        team.color = color;
        team.image = image;

        showToast("تیم ویرایش شد.");

    } else {

        data.teams.push({

            id: generateId("team"),

            name,

            color,

            image,

            createdAt:
                new Date().toISOString()

        });

        showToast("تیم اضافه شد.");

    }


    saveData();

    closeModal("teamModal");

    renderTeams();

    updateDashboard();

    renderPlayerFilters();

    updateTeamSelects();

}


function renderTeams() {

    const container =
        document.getElementById("teamsList");


    if (data.teams.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز تیمی اضافه نشده است.
                <br><br>
                از دکمه «افزودن تیم» شروع کنید.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data.teams
            .map(team => {

                const playerCount =
                    data.players.filter(
                        player =>
                            player.teamId === team.id
                    ).length;


                const imageHTML =
                    team.image

                        ? `
                            <img
                                class="team-logo"
                                src="${team.image}"
                                alt="${escapeHTML(team.name)}"
                            >
                        `

                        : `
                            <div
                                class="team-logo-placeholder"
                                style="border-right:8px solid ${team.color || "#2563eb"}"
                            >
                                ⚽
                            </div>
                        `;


                return `

                    <div class="team-card">

                        <div class="team-top">

                            ${imageHTML}

                            <div>

                                <h3>
                                    ${escapeHTML(team.name)}
                                </h3>

                                <p>
                                    👤 ${playerCount} بازیکن
                                </p>

                                <p>
                                    🎨 رنگ تیم
                                </p>

                            </div>

                        </div>


                        <div class="card-actions">

                            <button
                                class="small-button"
                                onclick="openTeamForm('${team.id}')"
                            >
                                ✏️ ویرایش
                            </button>

                            <button
                                class="small-button"
                                onclick="showTeamPlayers('${team.id}')"
                            >
                                👤 بازیکنان
                            </button>

                            <button
                                class="small-button danger"
                                onclick="deleteTeam('${team.id}')"
                            >
                                🗑️ حذف
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function showTeamPlayers(teamId) {

    const team =
        getTeam(teamId);

    if (!team) return;

    showPage("players");

    document
        .getElementById("playerTeamFilter")
        .value = teamId;

    renderPlayers();

}


function deleteTeam(teamId) {

    const team =
        getTeam(teamId);

    if (!team) return;


    const hasPlayers =
        data.players.some(
            player =>
                player.teamId === teamId
        );


    if (hasPlayers) {

        alert(
            "ابتدا بازیکنان این تیم را حذف یا به تیم دیگری منتقل کنید."
        );

        return;

    }


    const hasMatches =
        data.matches.some(
            match =>
                match.team1Id === teamId ||
                match.team2Id === teamId
        );


    if (hasMatches) {

        alert(
            "این تیم در مسابقه ثبت شده و حذف آن ممکن است اطلاعات مسابقات را خراب کند."
        );

        return;

    }


    if (
        !confirm(
            `تیم «${team.name}» حذف شود؟`
        )
    ) {
        return;
    }


    data.teams =
        data.teams.filter(
            item =>
                item.id !== teamId
        );


    saveData();

    renderTeams();

    updateDashboard();

    renderPlayerFilters();

    updateTeamSelects();

    showToast("تیم حذف شد.");

}


/* =========================================================
   PLAYERS
========================================================= */

function openPlayerForm(playerId = "") {

    updateTeamSelects();


    const modal =
        document.getElementById("playerModal");


    document
        .getElementById("playerId")
        .value = playerId;


    document
        .getElementById("playerImage")
        .value = "";


    const preview =
        document
            .getElementById("playerImagePreview");


    if (playerId) {

        const player =
            getPlayer(playerId);

        if (!player) return;


        document
            .getElementById("playerModalTitle")
            .textContent =
                "✏️ ویرایش بازیکن";


        document
            .getElementById("playerName")
            .value = player.name;


        document
            .getElementById("playerNumber")
            .value = player.number;


        document
            .getElementById("playerPosition")
            .value = player.position;


        document
            .getElementById("playerTeam")
            .value = player.teamId;


        document
            .getElementById("playerCaptain")
            .checked =
                Boolean(player.captain);


        if (player.image) {

            preview.src =
                player.image;

            preview.classList.remove("hidden");

        } else {

            preview.classList.add("hidden");

        }

    } else {

        document
            .getElementById("playerModalTitle")
            .textContent =
                "➕ افزودن بازیکن";


        document
            .getElementById("playerName")
            .value = "";


        document
            .getElementById("playerNumber")
            .value = "";


        document
            .getElementById("playerPosition")
            .value = "";


        document
            .getElementById("playerTeam")
            .value = "";


        document
            .getElementById("playerCaptain")
            .checked = false;


        preview.classList.add("hidden");

    }


    modal.classList.add("show");

}


async function savePlayer(event) {

    event.preventDefault();


    const id =
        document.getElementById("playerId").value;


    const name =
        document
            .getElementById("playerName")
            .value
            .trim();


    const number =
        Number(
            document
                .getElementById("playerNumber")
                .value
        );


    const position =
        document
            .getElementById("playerPosition")
            .value;


    const teamId =
        document
            .getElementById("playerTeam")
            .value;


    const captain =
        document
            .getElementById("playerCaptain")
            .checked;


    const imageFile =
        document
            .getElementById("playerImage")
            .files[0];


    if (!name || !teamId) {

        alert(
            "نام و تیم بازیکن را وارد کنید."
        );

        return;

    }


    let image = "";


    if (id) {

        const old =
            getPlayer(id);

        image =
            old
                ? old.image || ""
                : "";

    }


    if (imageFile) {

        image =
            await readImage(imageFile);

    }


    /*
       اگر بازیکن کاپیتان شد،
       کاپیتانی قبلی همان تیم حذف می‌شود.
    */

    if (captain) {

        data.players.forEach(player => {

            if (
                player.teamId === teamId &&
                player.id !== id
            ) {

                player.captain = false;

            }

        });

    }


    if (id) {

        const player =
            getPlayer(id);

        player.name = name;
        player.number = number;
        player.position = position;
        player.teamId = teamId;
        player.captain = captain;
        player.image = image;

        showToast(
            "اطلاعات بازیکن ویرایش شد."
        );

    } else {

        data.players.push({

            id:
                generateId("player"),

            name,

            number,

            position,

            teamId,

            captain,

            image,

            games: 0,

            assists: 0,

            yellow: 0,

            red: 0,

            createdAt:
                new Date().toISOString()

        });

        showToast(
            "بازیکن اضافه شد."
        );

    }


    saveData();

    closeModal("playerModal");

    renderPlayers();

    updateDashboard();

    renderPlayerFilters();

    renderPlayerStats();

}


function renderPlayerFilters() {

    const select =
        document.getElementById(
            "playerTeamFilter"
        );


    const current =
        select.value || "all";


    select.innerHTML = `
        <option value="all">
            همه تیم‌ها
        </option>
    `;


    data.teams.forEach(team => {

        select.innerHTML += `
            <option value="${team.id}">
                ${escapeHTML(team.name)}
            </option>
        `;

    });


    if (
        data.teams.some(
            team =>
                team.id === current
        )
    ) {

        select.value = current;

    } else {

        select.value = "all";

    }

}


function renderPlayers() {

    const container =
        document.getElementById("playersList");


    const search =
        (
            document
                .getElementById("playerSearch")
                ?.value || ""
        )
            .trim()
            .toLowerCase();


    const filter =
        document
            .getElementById("playerTeamFilter")
            ?.value || "all";


    let players =
        data.players.filter(player => {

            const matchesSearch =
                player.name
                    .toLowerCase()
                    .includes(search);


            const matchesTeam =
                filter === "all" ||
                player.teamId === filter;


            return (
                matchesSearch &&
                matchesTeam
            );

        });


    if (players.length === 0) {

        container.innerHTML = `
            <div class="empty">
                بازیکنی پیدا نشد.
            </div>
        `;

        return;

    }


    container.innerHTML =
        players
            .map(player => {

                const image =
                    player.image

                        ? `
                            <img
                                class="player-image"
                                src="${player.image}"
                                alt="${escapeHTML(player.name)}"
                            >
                        `

                        : `
                            <div class="player-placeholder">
                                👤
                            </div>
                        `;


                return `

                    <div class="player-card">

                        ${image}

                        <div class="player-info">

                            <span class="player-number">
                                #${player.number}
                            </span>

                            <h3>
                                ${escapeHTML(player.name)}
                            </h3>

                            <p>
                                ⚽ ${escapeHTML(player.position)}
                            </p>

                            <p>
                                👥 ${escapeHTML(
                                    getTeamName(player.teamId)
                                )}
                            </p>

                            ${
                                player.captain
                                    ? `
                                        <p class="captain">
                                            👑 کاپیتان
                                        </p>
                                    `
                                    : ""
                            }


                            <div class="card-actions">

                                <button
                                    class="small-button"
                                    onclick="openPlayerForm('${player.id}')"
                                >
                                    ✏️
                                </button>

                                <button
                                    class="small-button danger"
                                    onclick="deletePlayer('${player.id}')"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function deletePlayer(playerId) {

    const player =
        getPlayer(playerId);

    if (!player) return;


    if (
        !confirm(
            `بازیکن «${player.name}» حذف شود؟`
        )
    ) {
        return;
    }


    data.players =
        data.players.filter(
            item =>
                item.id !== playerId
        );


    /*
       گل‌های ثبت‌شده این بازیکن
       را حذف نمی‌کنیم؛
       فقط گلزن خالی می‌شود.
    */

    data.matches.forEach(match => {

        if (Array.isArray(match.goals)) {

            match.goals.forEach(goal => {

                if (
                    goal.playerId === playerId
                ) {

                    goal.playerId = "";

                }

            });

        }

    });


    saveData();

    renderPlayers();

    renderPlayerStats();

    renderMatches();

    showToast("بازیکن حذف شد.");

}


/* =========================================================
   TEAM SELECTS
========================================================= */

function updateTeamSelects() {

    const selects = [

        document.getElementById("playerTeam"),

        document.getElementById("matchTeam1"),

        document.getElementById("matchTeam2")

    ];


    selects.forEach(select => {

        if (!select) return;


        const current =
            select.value;


        select.innerHTML = `
            <option value="">
                انتخاب تیم
            </option>
        `;


        data.teams.forEach(team => {

            select.innerHTML += `
                <option value="${team.id}">
                    ${escapeHTML(team.name)}
                </option>
            `;

        });


        if (
            data.teams.some(
                team =>
                    team.id === current
            )
        ) {

            select.value = current;

        }

    });

}


/* =========================================================
   MATCHES
========================================================= */

function openMatchForm(matchId = "") {

    updateTeamSelects();


    const modal =
        document.getElementById("matchModal");


    document
        .getElementById("matchId")
        .value = matchId;


    const status =
        document
            .getElementById("matchStatus");


    if (matchId) {

        const match =
            data.matches.find(
                item =>
                    item.id === matchId
            );


        if (!match) return;


        document
            .getElementById("matchTitle")
            .value = match.title;


        document
            .getElementById("matchTeam1")
            .value = match.team1Id;


        document
            .getElementById("matchTeam2")
            .value = match.team2Id;


        document
            .getElementById("matchDate")
            .value = match.date;


        document
            .getElementById("matchTime")
            .value = match.time;


        status.value =
            match.status;


        document
            .getElementById("matchScore1")
            .value =
                match.score1 ?? 0;


        document
            .getElementById("matchScore2")
            .value =
                match.score2 ?? 0;


        renderGoalEditor(
            match.goals || []
        );

    } else {

        document
            .getElementById("matchTitle")
            .value = "";


        document
            .getElementById("matchTeam1")
            .value = "";


        document
            .getElementById("matchTeam2")
            .value = "";


        document
            .getElementById("matchDate")
            .value = "";


        document
            .getElementById("matchTime")
            .value = "";


        status.value =
            "scheduled";


        document
            .getElementById("matchScore1")
            .value = 0;


        document
            .getElementById("matchScore2")
            .value = 0;


        renderGoalEditor([]);

    }


    updateMatchResultVisibility();


    modal.classList.add("show");

}


function updateMatchResultVisibility() {

    const status =
        document
            .getElementById("matchStatus")
            .value;


    const box =
        document
            .getElementById("matchResultFields");


    box.style.display =
        status === "finished"
            ? "block"
            : "none";

}


function renderGoalEditor(goals) {

    const container =
        document.getElementById("goalsEditor");


    container.innerHTML = "";


    if (
        !goals ||
        goals.length === 0
    ) {

        return;

    }


    goals.forEach(goal => {

        addGoalRow(
            goal.teamId || "",
            goal.playerId || ""
        );

    });

}


function addGoalRow(
    teamId = "",
    playerId = ""
) {

    const container =
        document.getElementById("goalsEditor");


    const row =
        document.createElement("div");

    row.className =
        "goal-row";


    const teamSelect =
        document.createElement("select");

    teamSelect.className =
        "goal-team";

    teamSelect.innerHTML = `
        <option value="">
            تیم گل
        </option>
    `;


    data.teams.forEach(team => {

        teamSelect.innerHTML += `
            <option value="${team.id}">
                ${escapeHTML(team.name)}
            </option>
        `;

    });


    teamSelect.value =
        teamId;


    const playerSelect =
        document.createElement("select");

    playerSelect.className =
        "goal-player";


    function updatePlayers() {

        playerSelect.innerHTML = `
            <option value="">
                گلزن
            </option>
        `;


        const players =
            data.players.filter(
                player =>
                    player.teamId ===
                    teamSelect.value
            );


        players.forEach(player => {

            playerSelect.innerHTML += `
                <option value="${player.id}">
                    #${player.number} -
                    ${escapeHTML(player.name)}
                </option>
            `;

        });


        playerSelect.value =
            playerId;

    }


    teamSelect.addEventListener(
        "change",
        () => {

            playerId = "";

            updatePlayers();

        }
    );


    updatePlayers();


    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "remove-goal";

    removeButton.textContent =
        "✕";


    removeButton.onclick =
        () => {

            row.remove();

        };


    row.appendChild(teamSelect);

    row.appendChild(playerSelect);

    row.appendChild(removeButton);


    container.appendChild(row);

}


function saveMatch(event) {

    event.preventDefault();


    const id =
        document
            .getElementById("matchId")
            .value;


    const title =
        document
            .getElementById("matchTitle")
            .value
            .trim();


    const team1Id =
        document
            .getElementById("matchTeam1")
            .value;


    const team2Id =
        document
            .getElementById("matchTeam2")
            .value;


    const date =
        document
            .getElementById("matchDate")
            .value;


    const time =
        document
            .getElementById("matchTime")
            .value;


    const status =
        document
            .getElementById("matchStatus")
            .value;


    const score1 =
        Number(
            document
                .getElementById("matchScore1")
                .value
        ) || 0;


    const score2 =
        Number(
            document
                .getElementById("matchScore2")
                .value
        ) || 0;


    if (team1Id === team2Id) {

        alert(
            "دو تیم مسابقه باید متفاوت باشند."
        );

        return;

    }


    const goalRows =
        document
            .querySelectorAll(
                "#goalsEditor .goal-row"
            );


    const goals = [];


    goalRows.forEach(row => {

        const team =
            row.querySelector(
                ".goal-team"
            ).value;


        const player =
            row.querySelector(
                ".goal-player"
            ).value;


        if (team) {

            goals.push({

                id:
                    generateId("goal"),

                teamId: team,

                playerId: player

            });

        }

    });


    if (status === "finished") {

        const totalGoals =
            score1 + score2;


        if (
            goals.length !==
            totalGoals
        ) {

            const continueAnyway =
                confirm(
                    `نتیجه ${totalGoals} گل دارد ولی ${goals.length} گلزن ثبت شده است.\n\nآیا با همین اطلاعات ذخیره شود؟`
                );


            if (!continueAnyway) {
                return;
            }

        }

    }


    if (id) {

        const match =
            data.matches.find(
                item =>
                    item.id === id
            );


        if (!match) return;


        match.title = title;
        match.team1Id = team1Id;
        match.team2Id = team2Id;
        match.date = date;
        match.time = time;
        match.status = status;
        match.score1 = score1;
        match.score2 = score2;
        match.goals = goals;


        showToast(
            "مسابقه ویرایش شد."
        );

    } else {

        data.matches.push({

            id:
                generateId("match"),

            title,

            team1Id,

            team2Id,

            date,

            time,

            status,

            score1,

            score2,

            goals,

            createdAt:
                new Date().toISOString()

        });


        showToast(
            "مسابقه اضافه شد."
        );

    }


    saveData();

    closeModal("matchModal");

    renderMatches();

    renderStandings();

    renderPlayerStats();

    renderResults();

    updateDashboard();

}


function renderMatches() {

    const container =
        document.getElementById("matchesList");


    if (data.matches.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز مسابقه‌ای ثبت نشده است.
            </div>
        `;

        return;

    }


    const matches =
        [...data.matches]
            .sort(
                (a, b) =>
                    new Date(
                        `${a.date}T${a.time}`
                    )
                    -
                    new Date(
                        `${b.date}T${b.time}`
                    )
            );


    container.innerHTML =
        matches
            .map(match => {

                const team1 =
                    getTeam(match.team1Id);

                const team2 =
                    getTeam(match.team2Id);


                return `

                    <div class="match-card">

                        <div class="match-header">

                            <h3>
                                🏆 ${escapeHTML(match.title)}
                            </h3>

                            <span
                                class="status ${match.status}"
                            >
                                ${
                                    match.status ===
                                    "finished"
                                        ? "پایان‌یافته"
                                        : "برنامه‌ریزی‌شده"
                                }
                            </span>

                        </div>


                        <div class="match-teams">

                            <div class="match-team">

                                ${
                                    team1?.image
                                        ? `
                                            <img
                                                src="${team1.image}"
                                                class="team-logo"
                                                alt=""
                                            >
                                        `
                                        : "⚽"
                                }

                                <br>

                                ${escapeHTML(
                                    team1?.name ||
                                    "تیم اول"
                                )}

                            </div>


                            <div class="match-score">

                                ${
                                    match.status ===
                                    "finished"

                                        ? `
                                            ${match.score1}
                                            -
                                            ${match.score2}
                                        `

                                        : "VS"
                                }

                            </div>


                            <div class="match-team">

                                ${
                                    team2?.image
                                        ? `
                                            <img
                                                src="${team2.image}"
                                                class="team-logo"
                                                alt=""
                                            >
                                        `
                                        : "⚽"
                                }

                                <br>

                                ${escapeHTML(
                                    team2?.name ||
                                    "تیم دوم"
                                )}

                            </div>

                        </div>


                        <div class="match-date">

                            📅 ${formatDate(match.date)}

                            <br>

                            ⏰ ${match.time}

                        </div>


                        ${
                            match.status ===
                            "finished"

                                ? `
                                    <p>
                                        ⚽
                                        ${match.goals?.length || 0}
                                        گل ثبت شده
                                    </p>
                                `
                                : ""
                        }


                        <div class="card-actions">

                            <button
                                class="small-button"
                                onclick="openMatchForm('${match.id}')"
                            >
                                ✏️ ویرایش
                            </button>

                            <button
                                class="small-button danger"
                                onclick="deleteMatch('${match.id}')"
                            >
                                🗑️ حذف
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function deleteMatch(matchId) {

    const match =
        data.matches.find(
            item =>
                item.id === matchId
        );


    if (!match) return;


    if (
        !confirm(
            "این مسابقه حذف شود؟"
        )
    ) {
        return;
    }


    data.matches =
        data.matches.filter(
            item =>
                item.id !== matchId
        );


    saveData();

    renderMatches();

    renderStandings();

    renderPlayerStats();

    renderResults();

    updateDashboard();

    showToast(
        "مسابقه حذف شد."
    );

}


/* =========================================================
   STANDINGS
========================================================= */

function calculateStandings() {

    const table =
        data.teams.map(team => ({

            teamId: team.id,

            team: team.name,

            games: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            goalDiff: 0,

            points: 0

        }));


    data.matches
        .filter(
            match =>
                match.status === "finished"
        )
        .forEach(match => {

            const home =
                table.find(
                    item =>
                        item.teamId ===
                        match.team1Id
                );


            const away =
                table.find(
                    item =>
                        item.teamId ===
                        match.team2Id
                );


            if (!home || !away) {
                return;
            }


            const score1 =
                Number(match.score1) || 0;


            const score2 =
                Number(match.score2) || 0;


            home.games++;
            away.games++;


            home.goalsFor += score1;
            home.goalsAgainst += score2;

            away.goalsFor += score2;
            away.goalsAgainst += score1;


            if (score1 > score2) {

                home.wins++;
                home.points += 3;

                away.losses++;

            } else if (
                score2 > score1
            ) {

                away.wins++;
                away.points += 3;

                home.losses++;

            } else {

                home.draws++;
                away.draws++;

                home.points++;
                away.points++;

            }

        });


    table.forEach(item => {

        item.goalDiff =
            item.goalsFor -
            item.goalsAgainst;

    });


    table.sort((a, b) => {

        if (
            b.points !==
            a.points
        ) {

            return (
                b.points -
                a.points
            );

        }


        if (
            b.goalDiff !==
            a.goalDiff
        ) {

            return (
                b.goalDiff -
                a.goalDiff
            );

        }


        return (
            b.goalsFor -
            a.goalsFor
        );

    });


    return table;

}


function renderStandings() {

    const container =
        document.getElementById(
            "standings"
        );


    const table =
        calculateStandings();


    if (table.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="10">
                    هنوز تیمی ثبت نشده است.
                </td>
            </tr>
        `;

        return;

    }


    container.innerHTML =
        table
            .map((team, index) => `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(team.team)}
                        </strong>
                    </td>

                    <td>
                        ${team.games}
                    </td>

                    <td>
                        ${team.wins}
                    </td>

                    <td>
                        ${team.draws}
                    </td>

                    <td>
                        ${team.losses}
                    </td>

                    <td>
                        ${team.goalsFor}
                    </td>

                    <td>
                        ${team.goalsAgainst}
                    </td>

                    <td>
                        ${team.goalDiff}
                    </td>

                    <td>
                        <strong>
                            ${team.points}
                        </strong>
                    </td>

                </tr>

            `)
            .join("");

}


/* =========================================================
   PLAYER STATS
========================================================= */

function calculatePlayerStats() {

    const stats =
        data.players.map(player => ({

            ...player,

            games: 0,

            goals: 0,

            assists:
                Number(player.assists) || 0,

            yellow:
                Number(player.yellow) || 0,

            red:
                Number(player.red) || 0

        }));


    const finishedMatches =
        data.matches.filter(
            match =>
                match.status === "finished"
        );


    finishedMatches.forEach(match => {

        const involvedTeams = [
            match.team1Id,
            match.team2Id
        ];


        stats.forEach(player => {

            if (
                involvedTeams.includes(
                    player.teamId
                )
            ) {

                player.games++;

            }

        });


        (match.goals || [])
            .forEach(goal => {

                const player =
                    stats.find(
                        item =>
                            item.id ===
                            goal.playerId
                    );


                if (player) {

                    player.goals++;

                }

            });

    });


    return stats;

}


function renderPlayerStats() {

    const container =
        document.getElementById(
            "playerStats"
        );


    const stats =
        calculatePlayerStats()
            .sort(
                (a, b) =>
                    b.goals -
                    a.goals
            );


    if (stats.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="9">
                    هنوز بازیکنی ثبت نشده است.
                </td>
            </tr>
        `;

        document
            .getElementById(
                "topScorerName"
            )
            .textContent = "-";

        document
            .getElementById(
                "topScorerGoals"
            )
            .textContent = "0";

        return;

    }


    const top =
        stats[0];


    document
        .getElementById(
            "topScorerName"
        )
        .textContent =
            top.name;


    document
        .getElementById(
            "topScorerGoals"
        )
        .textContent =
            top.goals;


    container.innerHTML =
        stats
            .map(player => `

                <tr>

                    <td>
                        ${escapeHTML(player.name)}
                    </td>

                    <td>
                        ${escapeHTML(
                            getTeamName(
                                player.teamId
                            )
                        )}
                    </td>

                    <td>
                        #${player.number}
                    </td>

                    <td>
                        ${escapeHTML(
                            player.position
                        )}
                    </td>

                    <td>
                        ${player.games}
                    </td>

                    <td>
                        <strong>
                            ${player.goals}
                        </strong>
                    </td>

                    <td>
                        ${player.assists}
                    </td>

                    <td>
                        ${player.yellow}
                    </td>

                    <td>
                        ${player.red}
                    </td>

                </tr>

            `)
            .join("");

}


/* =========================================================
   RESULTS
========================================================= */

function renderResults() {

    const container =
        document.getElementById(
            "resultsList"
        );


    const results =
        data.matches.filter(
            match =>
                match.status ===
                "finished"
        );


    if (results.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز نتیجه‌ای ثبت نشده است.
            </div>
        `;

        return;

    }


    container.innerHTML =
        results
            .map(match => `

                <div class="result-card">

                    <h3>
                        🏆
                        ${escapeHTML(match.title)}
                    </h3>

                    <div class="match-teams">

                        <div class="match-team">

                            ${escapeHTML(
                                getTeamName(
                                    match.team1Id
                                )
                            )}

                        </div>

                        <div class="match-score">

                            ${match.score1}
                            -
                            ${match.score2}

                        </div>

                        <div class="match-team">

                            ${escapeHTML(
                                getTeamName(
                                    match.team2Id
                                )
                            )}

                        </div>

                    </div>

                    <div class="match-date">

                        📅
                        ${formatDate(match.date)}

                        <br>

                        ⏰
                        ${match.time}

                    </div>

                </div>

            `)
            .join("");

}


/* =========================================================
   NEWS
========================================================= */

function openNewsForm(newsId = "") {

    document
        .getElementById("newsId")
        .value = newsId;


    if (newsId) {

        const item =
            data.news.find(
                news =>
                    news.id === newsId
            );


        if (!item) return;


        document
            .getElementById("newsTitle")
            .value =
                item.title;


        document
            .getElementById("newsText")
            .value =
                item.text;

    } else {

        document
            .getElementById("newsTitle")
            .value = "";


        document
            .getElementById("newsText")
            .value = "";

    }


    document
        .getElementById("newsModal")
        .classList.add("show");

}


function saveNews(event) {

    event.preventDefault();


    const id =
        document
            .getElementById("newsId")
            .value;


    const title =
        document
            .getElementById("newsTitle")
            .value
            .trim();


    const text =
        document
            .getElementById("newsText")
            .value
            .trim();


    if (id) {

        const item =
            data.news.find(
                news =>
                    news.id === id
            );


        item.title = title;

        item.text = text;


        showToast(
            "اطلاعیه ویرایش شد."
        );

    } else {

        data.news.unshift({

            id:
                generateId("news"),

            title,

            text,

            date:
                new Date().toISOString()

        });


        showToast(
            "اطلاعیه اضافه شد."
        );

    }


    saveData();

    closeModal("newsModal");

    renderNews();

}


function renderNews() {

    const container =
        document.getElementById(
            "newsList"
        );


    if (data.news.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز اطلاعیه‌ای ثبت نشده است.
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.news
            .map(item => `

                <div class="news-card">

                    <h3>
                        📢
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.text)}
                    </p>

                    <small>
                        📅
                        ${new Date(
                            item.date
                        ).toLocaleDateString("fa-IR")}
                    </small>


                    <div class="card-actions">

                        <button
                            class="small-button"
                            onclick="openNewsForm('${item.id}')"
                        >
                            ✏️ ویرایش
                        </button>

                        <button
                            class="small-button danger"
                            onclick="deleteNews('${item.id}')"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


function deleteNews(newsId) {

    if (
        !confirm(
            "این اطلاعیه حذف شود؟"
        )
    ) {
        return;
    }


    data.news =
        data.news.filter(
            item =>
                item.id !== newsId
        );


    saveData();

    renderNews();

    showToast(
        "اطلاعیه حذف شد."
    );

}


/* =========================================================
   MODALS
========================================================= */

function closeModal(modalId) {

    document
        .getElementById(modalId)
        .classList.remove("show");

}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    document
        .getElementById("homeTeams")
        .textContent =
            data.teams.length;


    document
        .getElementById("homePlayers")
        .textContent =
            data.players.length;


    document
        .getElementById("homeMatches")
        .textContent =
            data.matches.length;


    const goals =
        data.matches
            .filter(
                match =>
                    match.status ===
                    "finished"
            )
            .reduce(
                (sum, match) =>
                    sum +
                    Number(match.score1 || 0) +
                    Number(match.score2 || 0),
                0
            );


    document
        .getElementById("homeGoals")
        .textContent =
            goals;


    renderNextMatch();

}


function renderNextMatch() {

    const container =
        document.getElementById(
            "nextMatch"
        );


    const upcoming =
        data.matches
            .filter(
                match =>
                    match.status ===
                    "scheduled"
            )
            .sort(
                (a, b) =>
                    new Date(
                        `${a.date}T${a.time}`
                    )
                    -
                    new Date(
                        `${b.date}T${b.time}`
                    )
            );


    if (upcoming.length === 0) {

        container.textContent =
            "مسابقه آینده‌ای ثبت نشده است.";

        return;

    }


    const match =
        upcoming[0];


    container.innerHTML = `

        <div class="match-card">

            <h3>
                ${escapeHTML(match.title)}
            </h3>

            <div class="match-teams">

                <div class="match-team">

                    ${escapeHTML(
                        getTeamName(
                            match.team1Id
                        )
                    )}

                </div>

                <strong>
                    VS
                </strong>

                <div class="match-team">

                    ${escapeHTML(
                        getTeamName(
                            match.team2Id
                        )
                    )}

                </div>

            </div>

            <div class="match-date">

                📅
                ${formatDate(match.date)}

                <br>

                ⏰
                ${match.time}

            </div>

        </div>

    `;

}


/* =========================================================
   PRINT
========================================================= */

function printInformation() {

    buildPrintReport();

    window.print();

}


function buildPrintReport() {

    /*
       اطلاعات اصلی قبل از چاپ
       در صفحات مختلف دیده می‌شوند.
    */

    renderTeams();

    renderPlayers();

    renderMatches();

    renderStandings();

    renderPlayerStats();

    renderResults();

    renderNews();

}


/* =========================================================
   BACKUP
========================================================= */

function backupData() {

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
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;

    a.download =
        "community-tournament-backup.json";


    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);


    showToast(
        "فایل پشتیبان ساخته شد."
    );

}


function restoreData(event) {

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

                const restored =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !restored ||
                    !Array.isArray(
                        restored.teams
                    ) ||
                    !Array.isArray(
                        restored.players
                    ) ||
                    !Array.isArray(
                        restored.matches
                    ) ||
                    !Array.isArray(
                        restored.news
                    )
                ) {

                    throw new Error(
                        "فرمت فایل اشتباه است."
                    );

                }


                if (
                    !confirm(
                        "اطلاعات فعلی با فایل پشتیبان جایگزین شود؟"
                    )
                ) {

                    return;

                }


                data = restored;

                saveData();

                refreshEverything();

                showToast(
                    "اطلاعات بازیابی شد."
                );

            } catch (error) {

                alert(
                    "فایل پشتیبان معتبر نیست."
                );

                console.error(error);

            }

        };


    reader.readAsText(file);


    event.target.value = "";

}


/* =========================================================
   RESET
========================================================= */

function resetAllData() {

    const first =
        confirm(
            "⚠️ همه تیم‌ها، بازیکنان، مسابقات و اطلاعیه‌ها حذف می‌شوند."
        );


    if (!first) {
        return;
    }


    const second =
        confirm(
            "واقعاً مطمئنی؟ این عملیات قابل برگشت نیست مگر اینکه قبلاً پشتیبان گرفته باشی."
        );


    if (!second) {
        return;
    }


    data =
        defaultData();


    saveData();

    refreshEverything();

    showToast(
        "تمام اطلاعات حذف شد."
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshEverything() {

    updateTeamSelects();

    renderPlayerFilters();

    renderTeams();

    renderPlayers();

    renderMatches();

    renderStandings();

    renderPlayerStats();

    renderResults();

    renderNews();

    updateDashboard();

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document
    .getElementById("matchStatus")
    .addEventListener(
        "change",
        updateMatchResultVisibility
    );


document
    .getElementById("teamImage")
    .addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) return;

            const image =
                await readImage(file);

            const preview =
                document.getElementById(
                    "teamImagePreview"
                );

            preview.src =
                image;

            preview.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("playerImage")
    .addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) return;

            const image =
                await readImage(file);

            const preview =
                document.getElementById(
                    "playerImagePreview"
                );

            preview.src =
                image;

            preview.classList.remove(
                "hidden"
            );

        }
    );


/* =========================================================
   START
========================================================= */

refreshEverything();

showPage("home");
