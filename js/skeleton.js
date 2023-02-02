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