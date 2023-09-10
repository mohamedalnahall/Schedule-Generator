let data = {
    preferences: {
        unwantedDays: { days: new Set(["th"]), weight: 100, defaultWeight: 100 },
        bestTimes: { from: 8, to: 12, weight: 1, defaultWeight: 1 },
        lectuersPerDay: { from: 2, to: 4, weight: 10000, defaultWeight: 10000 },
        maxFreeTime: { to: 1.5, weight: 10, defaultWeight: 10 },
        numOfDays: { to: 5, weight: 100, defaultWeight: 100 },
    },
    courses: {},
    schedules: [],
    settings: {
        generatingMethod: "fullScan",
        generations: 8000,
        intilizedSchedules: 200000,
        mututeProbablity: 0.6,
        fullScanSchedulesNumber: 5,
        conflictHandling: "treatAsSame",
        conflictCost: 1000000,
    }
};

const handler = {
    get: (target, key) => {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], handler);
        }

        return target[key];
    },
    set: (target, prop, value) => {
        if (target === data.courses) {
            if(!data.courses[prop]){
                let newCourse = document.createElement("div");
                newCourse.id = prop;
                newCourse.className = "unit bg-gray srow";
                newCourse.innerHTML =
                    `<span class="c-gray-3 ellipsis">${newCourse.id}</span><div class="crow"><svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="showEditCourse(this.parentElement.parentElement.id)")>
                        <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                        <path d="M13.5 6.5l4 4"></path>
                    </svg><svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" style="margin-left: -7px;" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="delete proxy.courses[this.parentElement.parentElement.id];">
                        <path d="M4 7l16 0"></path>
                        <path d="M10 11l0 6"></path>
                        <path d="M14 11l0 6"></path>
                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                    </svg></div>`
                document.getElementById("courses").insertBefore(newCourse, document.getElementById("coursesSeparator"));
            }
            data.courses[prop] = value;
        } else if (target === data && prop === "courses") {
            data.courses = {};
            document.getElementById("courses").innerHTML = 
            `
            <div id="coursesSeparator" style="margin-top: -14px;"></div>
            <button class="unit bg-gray c-gray-3 srow transy" onclick="showAddCourse()">
                اضافة مساق
                <svg class="button-icon transy" style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-3-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                    <path d="M9 12h6"></path>
                    <path d="M12 9v6"></path>
                </svg>
            </button>                    
            <div class="word-line srow">
                <div class="bg-gray-3"></div>
                <div class="bg-gray-3"></div>
            </div>
            <button for="json-selector" class="unit bg-gray c-gray-3 srow transy" onclick="uploadJson()">
                تحميل المساقات
                <svg class="button-icon transy" style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-3-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                    <path d="M12 11v6"></path>
                    <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"></path>
                </svg>
            </button>
            <button class="unit bg-gray c-gray-3 srow transy" onclick="downloadJson()">
                حفظ المساقات
                <svg class="button-icon transy" style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-3-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 11l5 5l5 -5"></path>
                    <path d="M12 4l0 12"></path>
                </svg>
            </button>`;
            for (const course in value) {
                document.getElementById("courseName").value = course;
                tempCourse = structuredClone(value[course]);
                addCourse();
            }
        }
        if(target[prop] != value) reset();
        target[prop] = value;
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        if (target === data.courses) {
            document.getElementById(prop).remove();
        }
        reset();
    }
};

const proxy = new Proxy(data, handler);

const daysMap = new Map();
daysMap.set("sa", "السبت");
daysMap.set("su", "الاحد");
daysMap.set("mo", "الاثنين");
daysMap.set("tu", "الثلاثاء");
daysMap.set("we", "الاربعاء");
daysMap.set("th", "الخميس");

function reset() {
    data.schedules = [];
    document.getElementById("schedulesPanel").classList.remove("open");
    document.getElementById("schedulesPanel").classList.remove("generated");
    document.getElementById("schedulesPanel").querySelector("h1").innerText = "توليد الجداول";
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.remove("fade-in");
    document.getElementById("schedules").innerHTML = "";
    document.getElementById("schedulesSliderDots").innerHTML = "";
}

function uploadJson() {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.click();
    input.addEventListener("change", (event) => {        
        const file = event.target.files[0]
        file.text().then((res) => {
            try {
                const courses = JSON.parse(res);
                proxy.courses = courses;
            } catch (error) {
                showErrorMsg("ملف المساقات غير صحيح");
            }
        })
        document.body.removeChild(input);
    })
}

function downloadJson() {
    if (Object.keys(data.courses).length === 0) {
        showErrorMsg("لا توجد مساقات مضافة");
        return;
    }
    try {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        const url = window.URL.createObjectURL(
            new Blob([JSON.stringify(data.courses, null, 2)], {
            type: "application/json",
        }));
        a.href = url;
        a.download = 'المساقات.json';
        a.target = "_blank";
        a.click();      
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showErrorMsg(error);
    }
}

let closing;
function openThemePanel(el) {
    if (el.style.height == '30px') {
        el.onmouseleave = () => {
            closing = setTimeout(() => { el.classList.remove('opend'); }, 100);
            el.style.height = '30px';
            el.querySelector(".arrow").removeAttribute("style");
            el.onmouseleave = null
        }
        clearTimeout(closing);
        el.classList.add('opend');
        el.querySelector(".arrow").style.transform = 'rotate(180deg)';
        el.style.height = '429px';
    } else {
        closing = setTimeout(() => { el.classList.remove('opend'); }, 100);
        el.style.height = '30px';
        el.querySelector(".arrow").removeAttribute("style");
    }
}

function nodeDrag(e, x, parts, minDiff, sliderId, preferenceRef, step = 1, startValue = 1) {
    if (e.button === 0) {
        const slider_line = document.querySelector(`${sliderId} .slider-line`);
        const slider_sel = document.querySelector(`${sliderId} .slider-selected`);
        const slider_parts = document.querySelector(`${sliderId} .slider-parts`);
        const slider_signs = document.querySelector(`${sliderId} .slider-signs`);
        const mouse_x = e.pageX;
        const start = parseInt(slider_sel.style.getPropertyValue("--start"));
        const end = parseInt(slider_sel.style.getPropertyValue("--end"));
        const partWidth = 100 / parts;

        function highlightSelected(next, x) {
            for (let i = 0; i < slider_parts.children.length; i++) {
                if (x === 1? next > i * partWidth : next < i * partWidth) {
                    slider_parts.children[i].className = "";
                    slider_signs.children[i].classList.remove("coverd");
                }
                else if (x === 1? end >= i * partWidth : start <= i * partWidth) {
                    slider_parts.children[i].className = "coverd";
                    slider_signs.children[i].classList.add("coverd");
                }
            }
        }
        if (x === 1) {
            document.onmousemove = (e) => {
                let next = start + (mouse_x - e.pageX) * 100 / slider_line.clientWidth;
                next = (next < 0 ? 0 : (next > end - minDiff * partWidth) ? end - minDiff * partWidth : next);
                slider_sel.style.setProperty("--start", next + "%");
                highlightSelected(next, 1);
            }
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                let start = parseFloat(slider_sel.style.getPropertyValue("--start"));
                start = Math.round(start / partWidth / step) * partWidth * step;
                slider_sel.style.setProperty("--start", start + "%");
                highlightSelected(start, 1);
                preferenceRef.from = startValue + (start/100) * parts;
            };
        }
        else if (x === 2) {
            document.onmousemove = (e) => {
                let next = end + (mouse_x - e.pageX) * 100 / slider_line.clientWidth;
                next = (next > 100 ? 100 : (next < start + minDiff * partWidth) ? start + minDiff * partWidth : next);
                slider_sel.style.setProperty("--end", next + "%");
                highlightSelected(next, 2);
            }
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                let end = parseFloat(slider_sel.style.getPropertyValue("--end"));
                end = Math.round(end / partWidth / step) * partWidth * step;
                slider_sel.style.setProperty("--end", end + "%");
                highlightSelected(end, 2);
                preferenceRef.to = startValue + (end/100) * parts;

            };
        }
    }
}

function unwant(el) {
    if (data.preferences.unwantedDays.days.has(el.id)) {
        data.preferences.unwantedDays.days.delete(el.id);
        el.classList.remove("unwanted");
    }
    else {
        data.preferences.unwantedDays.days.add(el.id);
        el.classList.add("unwanted");
    }
    reset();
}

function select(el) {
    if (!el.classList.contains("selected")) {
        for (const child of el.parentElement.children) {
            if (child.nodeName = "choice" && child.classList.contains("selected")) {
                child.classList.remove("selected");
                proxy.preferences.scheduleStyle = el.id;
                el.classList.add("selected");
                return;
            }
        }
    }
}

let pref;

function showPrefWeight(whichPref) {
    pref = whichPref;
    document.getElementById("prefWeight").value = pref.weight;
    document.getElementById("prefWeightPanel").classList.remove("hidden");
}

function updatePrefWeight() {
    let newWeight;
    if (newWeight = parseFloat(document.getElementById("prefWeight").value)) {
        if (newWeight <= 10000) {
            pref.weight = newWeight;
            hidePrefWeight();
        } else {
            showErrorMsg("الحد الاقصى 10000");
        }
    } else {
        showErrorMsg("ادخل رقما صحيحا");
    }
}

function resetPrefWeight() {
    document.getElementById("prefWeight").value = pref.defaultWeight;
}

function hidePrefWeight() {
    document.getElementById("prefWeightPanel").classList.add("hidden");
}

function showSettings() {
    const settings = document.getElementById("settings");
    for (const set in data.settings) {
        settings.elements[set].value = data.settings[set];
    }
    updateSettingsView();
    settings.classList.remove("hidden");
}

function updateSettings(event) {
    event.preventDefault();
    for (const set in data.settings) {
        if (typeof (data.settings[set]) === "number") {
            const value = parseFloat(settings.elements[set].value);
            if (isNaN(value) || !isFinite(value)) {                        
                settings.elements[set].classList.add('error');
                showErrorMsg("ادخل رقما صحيحا");
                return false;
            }             
            if (set === "mututeProbablity") {                
                if (value < 0 || value > 1) {                        
                    settings.elements[set].classList.add('error');
                    showErrorMsg("ادخل رقما بين 0 و 1");
                    return false;
                }
                data.settings[set] = value;
            }
            else data.settings[set] = parseInt(value);            
        }
        else data.settings[set] = settings.elements[set].value;        
    }
    reset();
    hideSettings();
}

function updateSettingsView() {
    const settings = document.getElementById("settings");
    if (settings.elements["generatingMethod"].value === "fullScan") {
        document.getElementById("noteSlot").innerHTML = ""
        document.getElementById("geneticSettings").style.display = "none";
        document.getElementById("fullScanSettings").style.display = "block";
    } else {
        document.getElementById("noteSlot").innerHTML = `<div class="rrow c-gray-txt" style="align-items:start">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="var(--gray-txt)" fill="var(--gray)" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" stroke-width="0" d="M12 12m-11 0a9 9 0 1022 0 9 9 0 10-22 0"></path>
            <path d="M12 8l0 4"></path>
            <path d="M12 16l.01 0"></path>
        </svg>
        <div style="margin-right: 8px;">ملاحظة : طريقة الوراثة تستخدم للجداول التي تحتوي على عدد شعب كبير و تحتاج وقت طويل جدا في طريقة المسح الكامل</div>
    </div>`;
        document.getElementById("fullScanSettings").style.display = "none";
        document.getElementById("geneticSettings").style.display = "flex";
    }
    if (settings.elements["conflictHandling"].value === "treatAsSame") {
        document.getElementById("conflictTimeSettings").style.display = "none";
    } else {
        document.getElementById("conflictTimeSettings").style.display = "block";
    }
}

function hideSettings() {
    document.getElementById("settings").classList.add("hidden");
}

let editedCourse = null;

let tempCourse = {};

let selectedBranch = null;

function showAddCourse() {
    document.getElementById("courseName").value = "";
    document.getElementById("courseName").classList.remove("error");
    for (const branch of document.getElementById("branches").querySelectorAll(".branch"))
        branch.remove();
    document.getElementById("timeSlots").innerHTML = "";
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.add("fade-out");
    const addCoursePanel = document.getElementById("addCoursePanel");
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='editCourse()']").style.display = "none";
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='addCourse()']").style.display = "block";
    addCoursePanel.classList.remove("hidden");
    addBranch(document.getElementById("branches").lastElementChild);
}

function showEditCourse(id) {
    document.getElementById("courseName").value = "";
    document.getElementById("courseName").classList.remove("error");
    for (const branch of document.getElementById("branches").querySelectorAll(".branch"))
        branch.remove();
    document.getElementById("timeSlots").innerHTML = "";
    editedCourse = id;
    document.getElementById("courseName").value = id;
    document.getElementById("courseName").classList.remove("error");
    for (const branch in data.courses[id]) {
        let newBranch = createBranch();
        document.getElementById("branches").insertBefore(newBranch, document.getElementById("branches").querySelector("button"));
        newBranch.querySelector('input').value = branch;
        newBranch.id = branch;
    }
    tempCourse = structuredClone(data.courses[id]);
    selectTab(document.getElementById("branches").querySelector(".branch"));
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.add("fade-out");
    const addCoursePanel = document.getElementById("addCoursePanel");
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='addCourse()']").style.display = "none";
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='editCourse()']").style.display = "block";
    addCoursePanel.classList.remove("hidden");
}

function hideAddCourse() {
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.remove("fade-out");
    document.getElementById("addCoursePanel").classList.add("hidden");
    tempCourse = {};
    selectedBranch = null;
}

function createBranch() {
    let newBranch = document.createElement('div');
    newBranch.className = "unit rrow c-black pointer tab branch";
    newBranch.setAttribute("onclick", "selectTab(this)");
    newBranch.setAttribute("displayer", "timeSlots");
    newBranch.setAttribute("dataHandler", "handleBranchData");
    newBranch.innerHTML = `
    <div class="c-black pointer">شعبة : </div>
    <input type="text" placeholder="رقم الشعبة" class="pointer" style="border-radius: 0; color: var(--gray-txt)" required ondblclick="this.removeAttribute('readonly'); this.style.color='var(--gray-txt)';" onfocus="this.classList.remove('error')" onblur="this.setAttribute('readonly',''); this.style.color='var(--black)'; checkBranchNum(this);">`
    return newBranch;
}

function addBranch(el) {
    let newBranch = createBranch();
    el.parentElement.insertBefore(newBranch, el);
    newBranch.querySelector('input').focus();
    if (selectedBranch === null) selectTab(newBranch);
}

function removeBranch() {
    if (selectedBranch === null) return;
    delete tempCourse[selectedBranch.id];
    document.getElementById(selectedBranch.getAttribute("displayer")).innerHTML = "";
    selectedBranch.remove();
    selectedBranch = null;
    selectTab(document.querySelector("#branches>.branch"));
}

function checkBranchNum(el) {
    if ((parseInt(el.parentElement.id) && el.value === "") || tempCourse[el.value]) {
        el.value = el.parentElement.id;
    }
    else if (parseInt(el.value)) {
        if (tempCourse[el.parentElement.id]) {
            tempCourse[el.value] = tempCourse[el.parentElement.id];
            delete tempCourse[el.parentElement.id];
        }
        el.parentElement.id = parseInt(el.value);
        if (!tempCourse[el.parentElement.id]) tempCourse[el.parentElement.id] = [];
    }
}

function selectTab(el) {
    if (el === null) return;
    for (const child of el.parentElement.children) {
        if (child.classList.contains('selected-tab')) {
            child.classList.remove('selected-tab');
            child.classList.add('tab');
            break;
        }
    }
    el.classList.remove('tab');
    el.classList.add('selected-tab');
    if(el.classList.contains("branch")) selectedBranch = el;
    window[el.getAttribute('dataHandler')]();
}

function createNewTimeSlot() {
    let newTimeSlot = document.createElement('div');
    newTimeSlot.className = "unit bg-gray srow timeSlot";
    newTimeSlot.style.padding = "0px 15px";
    newTimeSlot.innerHTML = `
<select name="day" class="bg-gray c-black" onchange='restrictTimeSlotsRepetition(this)'>
    <option value="sa">السبت</option>
    <option value="su">الاحد</option>
    <option value="mo">الاثنين</option>
    <option value="tu">الثلاثاء</option>
    <option value="we">الاربعاء</option>
    <option value="th">الخميس</option>
</select>
<div class="bg-black" style="height: 10px; width: 1px;"></div>
<select name="from" class="bg-gray c-black" onchange='restrictTimeSlotRange(this)'>
    <option value="8">8:00</option>
    <option value="8.5">8:30</option>
    <option value="9">9:00</option>
    <option value="9.5">9:30</option>
    <option value="10">10:00</option>
    <option value="10.5">10:30</option>
    <option value="11">11:00</option>
    <option value="11.5">11:30</option>
    <option value="12">12:00</option>
    <option value="12.5">12:30</option>
    <option value="13">13:00</option>
    <option value="13.5">13:30</option>
    <option value="14">14:00</option>
    <option value="14.5">14:30</option>
    <option value="15">15:00</option>
</select>
<div class="bg-black" style="height: 10px; width: 1px;"></div>
<select name="to" class="bg-gray c-black" onchange='restrictTimeSlotRange(this)'>
    <option value="9">9:00</option>
    <option value="9.5">9:30</option>
    <option value="10">10:00</option>
    <option value="10.5">10:30</option>
    <option value="11">11:00</option>
    <option value="11.5">11:30</option>
    <option value="12">12:00</option>
    <option value="12.5">12:30</option>
    <option value="13">13:00</option>
    <option value="13.5">13:30</option>
    <option value="14">14:00</option>
    <option value="14.5">14:30</option>
    <option value="15">15:00</option>
    <option value="15.5">15:30</option>
    <option value="16">16:00</option>
</select>
<svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="removeTimeSlot(this)">
    <path d="M4 7l16 0"></path>
    <path d="M10 11l0 6"></path>
    <path d="M14 11l0 6"></path>
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
</svg>`
    return newTimeSlot;
}

function handleBranchData() {
    let displayer = document.getElementById(selectedBranch.getAttribute('displayer'));
    displayer.innerHTML = '';
    if (parseInt(selectedBranch.id)) {
        for (let i = 0; i < tempCourse[selectedBranch.id].length; i++) {
            let newTimeSlot = createNewTimeSlot();
            newTimeSlot.id = i;
            displayer.appendChild(newTimeSlot);
            const day = newTimeSlot.querySelector("select[name='day']"),
                from = newTimeSlot.querySelector("select[name='from']"),
                to = newTimeSlot.querySelector("select[name='to']");
            day.value = tempCourse[selectedBranch.id][i][0];
            from.value = tempCourse[selectedBranch.id][i][1];
            to.value = tempCourse[selectedBranch.id][i][2];
            restrictTimeSlotsRepetition(day);
            restrictTimeSlotRange(from);
            restrictTimeSlotRange(to);
        }
    }
    const button = document.createElement('button');
    button.className = "unit bg-gray srow";
    button.setAttribute('onclick', "addTimeSlot(this)");
    button.innerHTML = `<div class="c-black">اضافة موعد</div>
    <svg style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="1" stroke="var(--black)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5l0 14"></path>
        <path d="M5 12l14 0"></path>
    </svg>`
    displayer.appendChild(button);
}

function addTimeSlot(el) {
    if (el.parentElement.children.length < 7) {
        if (parseInt(selectedBranch.id)) {
            let newTimeSlot = createNewTimeSlot();
            if (!tempCourse[selectedBranch.id]) tempCourse[selectedBranch.id] = [];
            newTimeSlot.id = tempCourse[selectedBranch.id].length;
            el.parentElement.insertBefore(newTimeSlot, el);
            restrictTimeSlotsRepetition(newTimeSlot.querySelector("select[name='day']"));
        } else {
            selectedBranch.querySelector("input").classList.add("error");
            showErrorMsg("ادخل رقم الشعبة اولا");
        }
    }
}

function removeTimeSlot(el) {
    tempCourse[selectedBranch.id] = tempCourse[selectedBranch.id].filter((item) => item != tempCourse[selectedBranch.id][el.parentElement.id]);
    el.parentElement.remove();
    recheckTimsSlotsDays(document.querySelectorAll('.timeSlot'));
}

function recheckTimsSlotsDays(timeSlots) {
    let avDays = ["sa", "su", "mo", "tu", "we", "th"];
    for (const timeSlot of timeSlots) {
        delete avDays[avDays.indexOf(timeSlot.querySelector("select[name='day']").value)];
    }
    for (const timeSlot of timeSlots) {
        let daySelect = timeSlot.querySelector("select[name='day']");
        for (const day of daySelect.options) {
            if (day.value != daySelect.value) {
                if (avDays.indexOf(day.value) === -1) {
                    day.setAttribute('disabled', 'disabled');
                    day.style.display = 'none';
                } else {
                    day.removeAttribute('disabled');
                    day.style.display = 'block';
                }
            }
        }
    }
}

function restrictTimeSlotsRepetition(el) {
    let avDays = ["sa", "su", "mo", "tu", "we", "th"];
    for (const timeSlot of el.parentElement.parentElement.querySelectorAll('.timeSlot')) {
        if (timeSlot != el.parentElement) {
            for (const day of el.options) {
                if (day.value === timeSlot.querySelector("select[name='day']").value) {
                    day.setAttribute('disabled', 'disabled');
                    day.style.display = 'none';
                    avDays = avDays.filter((item) => item != day.value);
                } else if(avDays.indexOf(day) != -1) {
                    day.removeAttribute('disabled');
                    day.style.display = 'block';
                }
            }
        }
    }
    if (el[el.selectedIndex].getAttribute('disabled') === 'disabled') el.value = avDays[0];
    recheckTimsSlotsDays(el.parentElement.parentElement.querySelectorAll('.timeSlot'));
    storeBranchData();
}

function restrictTimeSlotRange(el) {
    if (el.getAttribute("name") === "to") {
        const from = el.parentElement.querySelector("select[name='from']");
        restrictFrom(from, parseFloat(el.value));
        restrictTo(el, parseFloat(from.value));
    }
    if (el.getAttribute("name") === "from") {
        const to = el.parentElement.querySelector("select[name='to']");
        restrictTo(to, parseFloat(el.value));
        restrictFrom(el, parseFloat(to.value));
    }

    storeBranchData();
}

function restrictFrom(from, x) {
    const options = from.options;
    let lastValid = options.length - 1;
    for (let i = 0; i < options.length; i++) {
        if (parseFloat(options[i].value) > x - 1) {
            options[i].setAttribute('disabled', 'disabled');
            options[i].style.display = 'none';
        } else {
            options[i].removeAttribute('disabled');
            options[i].style.display = 'block';
            lastValid = i;
        }
    }
    if (parseFloat(from.value) > parseFloat(options[lastValid].value))
        from.value = options[lastValid].value;
}

function restrictTo(to, x) {
    const options = to.options;
    let firstValid = options.length - 1;
    for (let i = 0; i < options.length; i++) {
        if (parseFloat(options[i].value) < x + 1) {
            options[i].setAttribute('disabled', 'disabled');
            options[i].style.display = 'none';
        } else {
            options[i].removeAttribute('disabled');
            options[i].style.display = 'block';
            firstValid = Math.min(firstValid, i);
        }
    }
    if (parseFloat(to.value) < parseFloat(options[firstValid].value))
        to.value = options[firstValid].value;
}

function storeBranchData() {
    for (const timeSlot of document.getElementById(selectedBranch.getAttribute("displayer")).querySelectorAll('.timeSlot')) {
        tempCourse[selectedBranch.id][timeSlot.id] = [
            timeSlot.querySelector("select[name='day']").value,
            parseFloat(timeSlot.querySelector("select[name='from']").value),
            parseFloat(timeSlot.querySelector("select[name='to']").value)
        ];
    }
}

function checkCourseData() {
    if (document.getElementById("courseName").value === "") {
        document.getElementById("courseName").classList.add("error");
        showErrorMsg("لا يمكن لاسم المساق ان يكون فارغا!!");
        return false;
    }
    if (Object.keys(tempCourse).length === 0) {
        showErrorMsg("لا يمكن اضافة مساق لا يحتوي على شعب!!");
        return false;
    }
    for (const branch in tempCourse) {
        if (!branch) {
            document.getElementById(branch).querySelector("input").classList.add("error");
            showErrorMsg("بعض الشعب لا تمتلك رقما او ان رقمها ادخل بشكل خاطىء!!");
            return false;
        }
        if (tempCourse[branch].length === 0) {
            showErrorMsg("شعبة رقم " + branch + " لا تمتلك مواعيد!!");
            return false;
        }
    }
    return true;
}

function addCourse() {
    if (!checkCourseData()) return;
    proxy.courses[document.getElementById("courseName").value] = structuredClone(tempCourse);
    hideAddCourse();
}

function editCourse() { 
    if (!checkCourseData()) return;
    const courseName = document.getElementById("courseName").value;
    if (courseName != editedCourse) {
        delete proxy.courses[editedCourse];
        editedCourse = courseName; 
    }
    proxy.courses[editedCourse] = structuredClone(tempCourse);
    hideAddCourse();
}

function renderSchedules() {
    document.getElementById("schedulesSlider").style.setProperty("--size", data.schedules.length);
    document.getElementById("schedulesPanel").style.setProperty("--courses", Object.keys(data.courses).length);
    const days = ["sa", "su", "mo", "tu", "we", "th"];
    for (let i = 0; i < data.schedules.length; i++) {
        let newSchedule = document.createElement("div");
        newSchedule.className = "column gap-8 schedule";
        for (const course in data.schedules[i].branches) {
            let newRow = document.createElement("div");
            newRow.id = course + " " + i;
            newRow.className = "unit bg-gray srow";
            newRow.appendChild(createElementFromHTML(`<div class="c-gray-3 small name">${course}</div>`));
            newRow.appendChild(createElementFromHTML(`<div class="sep"></div>`));
            newRow.appendChild(createElementFromHTML(`<div class="c-gray-3 small branch">${data.schedules[i].branches[course]}</div>`));
            newRow.appendChild(createElementFromHTML(`<div class="sep"></div>`));
            for (const day of days) {
                newRow.appendChild(createElementFromHTML(`<div class="c-gray-3 small ${day} day"></div>`));
                if (day != "th") newRow.appendChild(createElementFromHTML(`<div class="sep"></div>`));
                else newRow.appendChild(createElementFromHTML(`<div class="row-end"></div>`));
            }
            newSchedule.appendChild(newRow);
            newSchedule.appendChild(createElementFromHTML(`<div class="hsep"></div>`));
        }
        newSchedule.removeChild(newSchedule.lastElementChild);
        document.getElementById("schedules").appendChild(newSchedule);
        document.getElementById("schedulesSliderDots").appendChild(createElementFromHTML(`<div class="bg-gray-3 transy pointer" style="width: 8px; height: 8px;" onclick="slideTo([...this.parentElement.children].indexOf(this))"></div>`));
        for (const day in data.schedules[i].days) {
            for (const course in data.schedules[i].days[day]) {
                let houre = Math.floor(data.schedules[i].days[day][course].timeSlot[0]);
                let minute = (data.schedules[i].days[day][course].timeSlot[0] % 1) * 60;
                minute = minute < 10 ? "0" + minute : minute;
                const from = `${houre}:${minute}`;
                houre = Math.floor(data.schedules[i].days[day][course].timeSlot[1]);
                minute = (data.schedules[i].days[day][course].timeSlot[1] % 1) * 60;
                minute = minute < 10 ? "0" + minute : minute;
                const to = `${houre}:${minute}`;
                const timeSlot = from + "-" + to;
                document.getElementById(course + " " + i).querySelector("."+day).innerText = timeSlot;
                if (data.schedules[i].days[day][course].conflicted) document.getElementById(course + " " + i).querySelector("."+day).classList.add("error");
            }
        }
    }
    
    document.getElementById("schedulesSlider").style.setProperty("--curr", 0);
    slideTo(0);
    document.getElementById("schedulesPanel").classList.add("generated");
    document.getElementById("schedulesPanel").querySelector("h1").innerText = `الجداول (${data.schedules.length})`;
}

function showSchedules() {
    if (!document.getElementById("schedulesPanel").classList.contains("generated")) {
        if (Object.keys(data.courses).length === 0) {
            showErrorMsg("لا توجد مساقات مضافة");
            return;
        }
        
        document.getElementById("loading").style.display = "block";

        const generatorWorker = new Worker('js/generator.worker.js');
        generatorWorker.postMessage(data);

        generatorWorker.addEventListener("message", (event) => {
            document.getElementById("loading").style.display = "none";
            data.schedules = event.data;
            renderSchedules();
            showSchedules();   
            generatorWorker.terminate();
        });
    }

    else if (document.getElementById("schedulesPanel").classList.contains("open")) {
        document.getElementById("schedulesPanel").classList.remove("open");
        document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.remove("fade-in");
    } else {
        document.getElementById("schedulesPanel").classList.add("open");
        document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.add("fade-in");
    }
}

function printSchedule() {
    const iframe = createElementFromHTML(`<iframe height="0" width="0" border="0" wmode="Opaque" style="position: absolute; top: -999px; left: -999px;"/>`);
    document.body.appendChild(iframe);

    const w = iframe.contentWindow || iframe.contentDocument;
    const wdoc = w.document || w.contentDocument;

    wdoc.open();

    wdoc.write(
        `
        <div class="rrow gap-14" style="margin-bottom:10px; margin-right:10px;">
            <h1>مولد الجداول</h1>
            <div>بواسطة محمد مدحت النحال</div>
            <a style="color: #0349fc" href='https://mohamedalnahall.github.io/Schedule-Generator/'>https://mohamedalnahall.github.io/Schedule-Generator</a>
        </div>
        <div class="rrow gap-8" style="flex-wrap:wrap; margin-bottom:10px; margin-right:10px;">
            <div class="small">الطريقة : ${data.settings.generatingMethod === 'fullScan'? 'المسح الكامل' : 'الوراثة'}</div>
            <div class="sep"></div>
            <div class="small">الايام غير المرغوبة : ${stringifyUnwantedDays()} (${data.preferences.unwantedDays.weight})</div>
            <div class="sep"></div>
            <div class="small">الاوقات المفضلة : ${data.preferences.bestTimes.from} - ${data.preferences.bestTimes.to} (${data.preferences.bestTimes.weight})</div>
            <div class="sep"></div>
            <div class="small">عدد الايام في الاسبوع : ${data.preferences.numOfDays.to} (${data.preferences.numOfDays.weight})</div>
            <div class="sep"></div>
            <div class="small">عدد المحاضرات : ${data.preferences.lectuersPerDay.from} - ${data.preferences.lectuersPerDay.to} (${data.preferences.lectuersPerDay.weight})</div>
            <div class="sep"></div>
            <div class="small">اقصى وقت فراغ : ${data.preferences.maxFreeTime.to} (${data.preferences.maxFreeTime.weight})</div>
        </div>
        <div style="border: 1px solid var(--gray); border-radius: 15px;">
            ${document.getElementById("schedulesHeader").outerHTML}
            <div class="hsep"></div>
            ${document.getElementById("schedules").children[parseInt(document.getElementById("schedulesSlider").style.getPropertyValue("--curr"))].innerHTML}
        </div>`
    );
    
    wdoc.head.append(createElementFromHTML(`<link rel="stylesheet" href="css/print.css" media="print">`));

    wdoc.dir = "rtl";
    wdoc.close();

    setTimeout(function() {
        w.focus();
        w.print();
        setTimeout(function() {
            document.body.removeChild(iframe);
        }, 100);
    }, 250);
}

function stringifyUnwantedDays() {
    let str = "";
    const iter = daysMap.keys();
    let value;
    while (value = iter.next().value) {
        if(data.preferences.unwantedDays.days.has(value)){
            str += daysMap.get(value) + "+";
        }
    }
    return str.substring(0,str.length - 1);
}

function slideTo(x) {
    if (x < 0 || x > parseInt(document.getElementById("schedulesSlider").style.getPropertyValue("--size")) + 1) return;

    document.getElementById("scheduleNum").innerText = x+1;
    document.getElementById("schedulesSliderDots").children[parseInt(document.getElementById("schedulesSlider").style.getPropertyValue("--curr"))].style.backgroundColor = "var(--gray-3)";
    document.getElementById("schedulesSliderDots").children[x].style.backgroundColor = "var(--gray-2-txt)";
    document.getElementById("schedulesSlider").style.setProperty("--curr", x);

    if (x === 0) document.getElementById("rightArrow").style.display = "none";
    else document.getElementById("rightArrow").style.display = "flex";
    if (x === document.getElementById("schedulesSlider").style.getPropertyValue("--size") - 1) document.getElementById("leftArrow").style.display = "none";
    else document.getElementById("leftArrow").style.display = "flex";
}

let errorTimeOut;
function showErrorMsg(msg) {
    clearTimeout(errorTimeOut);
    let errorMsg = document.getElementById("errorMsg");
    errorMsg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="margin-left: 10px" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="var(--red)" fill="var(--tred)" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" stroke-width="0" d="M12 12m-11 0a9 9 0 1022 0 9 9 0 10-22 0"></path>
    <path d="M12 8l0 4"></path>
    <path d="M12 16l.01 0"></path>
</svg>`;
    errorMsg.append(msg);
    errorMsg.style.top = "30px";
    errorTimeOut = setTimeout(() => {
        errorMsg.removeAttribute("style");
    }, 2000);
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}