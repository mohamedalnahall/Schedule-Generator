let data = {
    courses: {}
};

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
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
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
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
        }
    }
}

function unwant(el) {
    if (el.classList.contains("unwanted")) el.classList.remove("unwanted");
    else el.classList.add("unwanted")
}

function select(el) {
    if (!el.classList.contains("selected")) {
        for (const child of el.parentElement.children) {
            if (child.nodeName = "choice" && child.classList.contains("selected")) {
                child.classList.remove("selected");
                el.classList.add("selected");
                return;
            }
        }
    }
}

function showAddCourse() {
    document.getElementById("courseName").value = "";
    document.getElementById("courseName").classList.remove("error");
    for (const classNode of document.getElementById("classes").querySelectorAll(".class"))
        classNode.remove();
    document.getElementById("times").innerHTML = "";
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.add("fade-out");
    const addCoursePanel = document.getElementById("addCoursePanel");
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='editCourse()']").style.display = "none";
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='addCourse()']").style.display = "block";
    addCoursePanel.classList.remove("hidden");
}

let editedCourse = null;

function showEditCourse(id) {
    editedCourse = id;
    document.getElementById("courseName").value = data.courses[id].name;
    document.getElementById("courseName").classList.remove("error");
    for (const classNode of document.getElementById("classes").querySelectorAll(".class")) {
        if (data.courses[id][classNode.id] != null) {
            classNode.querySelector("input").value = data.courses[id][classNode.id].num;
        } else classNode.remove();
    }
    tempCourse = {...data.courses[id]};
    selectTab(document.getElementById("classes").querySelector(".class"));
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.add("fade-out");
    const addCoursePanel = document.getElementById("addCoursePanel");
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='addCourse()']").style.display = "none";
    addCoursePanel.querySelector("#addCoursePanel>div>button[onclick='editCourse()']").style.display = "block";
    addCoursePanel.classList.remove("hidden");
}

function hideAddCourse() {
    document.getElementById("mainPanel").querySelector("#mainPanel>div").classList.remove("fade-out");
    document.getElementById("addCoursePanel").classList.add("hidden");
    tempCourse = {name:""};
    selectedClass = null;
}

let tempCourse = {name:""};

let selectedClass = null;

function addClass(el) {
    let newClass = document.createElement('div');
    newClass.id = "class" + (Object.keys(tempCourse).length - 1);
    tempCourse[newClass.id] = {num:NaN};
    newClass.className = "unit rrow c-black pointer tab class";
    newClass.setAttribute("onclick", "selectTab(this)");
    newClass.setAttribute("displayer", "times");
    newClass.setAttribute("dataHandler", "classDataHandle");
    newClass.setAttribute("dataParser", "classStoreData");
    newClass.innerHTML = `
    <div class="c-black pointer">شعبة : </div>
    <input type="text" placeholder="رقم الشعبة" class="pointer" style="border-radius: 0; color: var(--gray-txt)" required ondblclick="this.removeAttribute('readonly'); this.style.color='var(--gray-txt)';" onfocus="this.classList.remove('error')" onblur="this.setAttribute('readonly',''); this.style.color='var(--black)'; tempCourse[this.parentElement.id].num = parseInt(this.value);">`
    if (el.parentElement.children.length === 1) {
        newClass.classList.remove('tab');
        newClass.classList.add('selected-tab');
    }
    el.parentElement.insertBefore(newClass, el);
    newClass.querySelector('input').focus();

    if (selectedClass === null) selectTab(newClass);
}

function removeClass() {
    if (selectedClass === null) return;
    delete tempCourse[selectedClass.id];
    document.getElementById(selectedClass.getAttribute("displayer")).innerHTML = "";
    selectedClass.remove();
    selectedClass = null;
    selectTab(document.querySelector("#classes>.class"));
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
    if(el.classList.contains("class")) selectedClass = el;
    window[el.getAttribute('dataHandler')]();
}

function createNewTime() {
    let newTime = document.createElement('div');
    newTime.className = "unit bg-gray srow time";
    newTime.style.padding = "0px 15px";
    newTime.innerHTML = `
<select name="day" class="bg-gray c-black" onchange='restrictTimeRepetition(this)'>
    <option value="sa">السبت</option>
    <option value="su">الاحد</option>
    <option value="mo">الاثنين</option>
    <option value="tu">الثلاثاء</option>
    <option value="we">الاربعاء</option>
    <option value="th">الخميس</option>
</select>
<div class="bg-black" style="height: 10px; width: 1px;"></div>
<select name="from" class="bg-gray c-black" onchange='restrictTimeRange(this)'>
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
<select name="to" class="bg-gray c-black" onchange='restrictTimeRange(this)'>
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
<svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="this.parentElement.remove()">
    <path d="M4 7l16 0"></path>
    <path d="M10 11l0 6"></path>
    <path d="M14 11l0 6"></path>
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
</svg>`
    return newTime;
}

function classDataHandle() {
    let displayer = document.getElementById(selectedClass.getAttribute('displayer'));
    displayer.innerHTML = '';
    for (let unit in tempCourse[selectedClass.id]) {
        if (unit === "num") continue;
        let newTime = createNewTime();
        newTime.id = unit;
        displayer.appendChild(newTime);
        const day = newTime.querySelector("select[name='day']"),
            from = newTime.querySelector("select[name='from']"),
            to = newTime.querySelector("select[name='to']");
        day.value = tempCourse[selectedClass.id][unit][0];
        from.value = tempCourse[selectedClass.id][unit][1];
        to.value = tempCourse[selectedClass.id][unit][2];
        restrictTimeRepetition(day);
        restrictTimeRange(from);
        restrictTimeRange(to);
    }
    const button = document.createElement('button');
    button.className = "unit bg-gray srow";
    button.setAttribute('onclick', "addTime(this)");
    button.innerHTML = `<div class="c-black">اضافة موعد</div>
    <svg style="margin-left: -7px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="1" stroke="var(--black)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5l0 14"></path>
        <path d="M5 12l14 0"></path>
    </svg>`
    displayer.appendChild(button);
}

function addTime(el) {
    if (el.parentElement.children.length < 7) {
        let newTime = createNewTime();
        newTime.id = "time" + (Object.keys(tempCourse[selectedClass.id]).length - 1);
        el.parentElement.insertBefore(newTime, el);
        restrictTimeRepetition(newTime.querySelector("select[name='day']"));
    }
}

function restrictTimeRepetition(el) {

    for (const time of el.parentElement.parentElement.querySelectorAll('.time')) {
        if (time != el.parentElement) {
            let avDays = ["sa", "su", "mo", "tu", "we", "th"];
            for (const day of el.options) {
                if (day.value === time.querySelector("select[name='day']").value) {
                    day.setAttribute('disabled', 'disabled');
                    day.style.display = 'none';
                    avDays = avDays.filter((item) => item != day.value);
                } else {
                    day.removeAttribute('disabled');
                    day.style.display = 'block';
                }
            }
            if(el[el.selectedIndex].getAttribute('disabled') === 'disabled') el.value = avDays[0];
            for (const day of time.querySelector("select[name='day']").options) {
                if (day.value === el.value) {
                    day.setAttribute('disabled', 'disabled');
                    day.style.display = 'none';
                } else {
                    day.removeAttribute('disabled');
                    day.style.display = 'block';
                }
            }
        }
    }

    classStoreData();
}

function restrictTimeRange(el) {
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

    classStoreData();
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

function classStoreData() {
    for (const time of document.getElementById(selectedClass.getAttribute("displayer")).querySelectorAll('.time')) {
        tempCourse[selectedClass.id][time.id] = [
            time.querySelector("select[name='day']").value,
            parseFloat(time.querySelector("select[name='from']").value),
            parseFloat(time.querySelector("select[name='to']").value)
        ]
    }
}

function checkCourseData() {
    if (tempCourse.name === "") {
        document.getElementById("courseName").classList.add("error");
        showErrorMsg("لا يمكن لاسم المساق ان يكون فارغا!!");
        return false;
    }
    if (Object.keys(tempCourse).length === 1) {
        showErrorMsg("لا يمكن اضافة مساق لا يحتوي على شعب!!");
        return false;
    }
    for (const s in tempCourse) {
        if (s === "name") continue;
        if (!tempCourse[s].num) {
            document.getElementById(s).querySelector("input").classList.add("error");
            showErrorMsg("بعض الشعب لا تمتلك رقما او ان رقمها ادخل بشكل خاطىء!!");
            return false;
        }
        if (Object.keys(tempCourse[s]).length === 1) {
            showErrorMsg("شعبة رقم " + tempCourse[s].num + " لا تمتلك مواعيد!!");
            return false;
        }
    }
    return true;
}

function addCourse() {
    if (!checkCourseData()) return;
    let newCourse = document.createElement("div");
    newCourse.id = "course" + (Object.keys(data.courses).length);
    data.courses[newCourse.id] = tempCourse;
    newCourse.className = "unit bg-gray srow";
    newCourse.innerHTML = `<span class="c-black">${tempCourse.name}</span><div class="crow"><svg xmlns="http://www.w3.org/2000/svg" class="pointer i-btn" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="var(--gray-2-txt)" fill="none" stroke-linecap="round" stroke-linejoin="round" onclick="showEditCourse(this.parentElement.parentElement.id)")>
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
    data.courses[editedCourse] = tempCourse;
    document.getElementById(editedCourse).querySelector("span").innerText = tempCourse.name;
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