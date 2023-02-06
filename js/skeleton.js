let data = {
    preferences: {
        unwantedDays: ["th"],
        bestTimes: { from: 8, to: 12 },
        scheduleStyle: "with_no_free_time"
    },
    courses: {},
    schedules: []
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
            document.getElementById("courseName").value = prop;
            tempCourse = structuredClone(value);
            if (!data.courses[prop]) {
                addCourse();
            }
            else editCourse(prop);
        } else if (target === data && prop === "courses") {
            document.getElementById("courses").innerHTML = `<button class="unit bg-gray srow" onclick="showAddCourse()">
            <span class="c-black">اضافة مساق</span>
            <svg style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="1" stroke="var(--black)" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5l0 14"></path>
                <path d="M5 12l14 0"></path>
            </svg>
        </button>`;
            for (const course in value) {
                document.getElementById("courseName").value = course;
                tempCourse = structuredClone(value[course]);
                addCourse();
            }
        }
        return true;
    }
};


const proxy = new Proxy(data, handler);

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

function timeNodeDrag(e, x) {
    if (e.button === 0) {
        const time_line = document.querySelector("#time_slider>div:first-child");
        const sel_time = document.querySelector("#time_slider>div:last-child");
        const mouse_x = e.pageX;
        const start = parseInt(sel_time.style.getPropertyValue("--start"));
        const end = parseInt(sel_time.style.getPropertyValue("--end"));
        if (x === 1) {
            document.onmousemove = (e) => {
                let next = start + (mouse_x - e.pageX) * 100 / time_line.clientWidth;
                next = (next < 0 ? 0 : (next > end - 12.5) ? end - 12.5 : next);
                next = ((next / 12.5) % 1 > 0.75 || (next / 12.5) % 1 < 0.25) ? Math.round(next / 12.5) * 12.5 : next;
                sel_time.style.setProperty("--start", next + "%");
                const children = time_line.children;
                for (let i = 0; i < children.length; i++) {
                    if (next > i * 12.5) children[i].className = "";
                    else if (end > i * 12.5) children[i].className = "coverd";
                }
            }
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                data.preferences.bestTimes.from = 8 + (parseFloat(sel_time.style.getPropertyValue("--start"))/100) * 8;
            };
        }
        else if (x === 2) {
            document.onmousemove = (e) => {
                let next = end + (mouse_x - e.pageX) * 100 / time_line.clientWidth;
                next = (next > 100 ? 100 : (next < start + 12.5) ? start + 12.5 : next);
                next = ((next / 12.5) % 1 > 0.75 || (next / 12.5) % 1 < 0.25) ? Math.round(next / 12.5) * 12.5 : next;
                sel_time.style.setProperty("--end", next + "%");
                const children = time_line.children;
                for (let i = 0; i < children.length; i++) {
                    if (next < i * 12.5) children[i].className = "";
                    else if (start < i * 12.5) children[i].className = "coverd";
                }
            }
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                data.preferences.bestTimes.to = 8 + (parseFloat(sel_time.style.getPropertyValue("--end"))/100) * 8;

            };
        }
    }
}

function unwant(el) {
    if (el.classList.contains("unwanted")) {
        delete data.preferences.unwantedDays[data.preferences.unwantedDays.indexOf(el.id)];
        el.classList.remove("unwanted");
    }
    else {
        data.preferences.unwantedDays.push(el.id);
        el.classList.add("unwanted");
    }
}

function select(el) {
    if (!el.classList.contains("selected")) {
        for (const child of el.parentElement.children) {
            if (child.nodeName = "choice" && child.classList.contains("selected")) {
                child.classList.remove("selected");
                data.preferences.scheduleStyle = el.id;
                el.classList.add("selected");
                return;
            }
        }
    }
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
                    console.log(timeSlot.querySelector("select[name='day']").value);
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
    let newCourse = document.createElement("div");
    newCourse.id = document.getElementById("courseName").value;
    data.courses[newCourse.id] = structuredClone(tempCourse);
    newCourse.className = "unit bg-gray srow";
    newCourse.innerHTML = `<span class="c-black">${newCourse.id}</span><div class="crow"><svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="showEditCourse(this.parentElement.parentElement.id)")>
    <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
    <path d="M13.5 6.5l4 4"></path>
</svg><svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" style="margin-left: -7px;" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="delete data[this.parentElement.parentElement.id]; this.parentElement.parentElement.remove();">
    <path d="M4 7l16 0"></path>
    <path d="M10 11l0 6"></path>
    <path d="M14 11l0 6"></path>
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
</svg></div>`
    document.getElementById("courses").insertBefore(newCourse, document.getElementById("courses").lastElementChild);
    hideAddCourse();
}

function editCourse() { 
    if (!checkCourseData()) return;
    const courseName = document.getElementById("courseName").value;
    if (courseName != editedCourse) {
        delete data.courses[editedCourse];
        document.getElementById(editedCourse).id = courseName;
        editedCourse = courseName; 
    }
    data.courses[editedCourse] = structuredClone(tempCourse);
    document.getElementById(editedCourse).querySelector("span").innerText = editedCourse;
    hideAddCourse();
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