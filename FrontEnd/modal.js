let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
let previouslyFocusedElement = null;

const openModal = async function (e) {
    e.preventDefault();
    const target = e.target.getAttribute("href")
    if (target.startsWith("#")) {
        modal = document.querySelector(e.target.getAttribute("href"));
    } else {
        modal = await loadModal(target)
    }

    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(":focus");
    modal.style.display = null;
    focusables[0].focus();
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-close")
        .addEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-stop")
        .addEventListener("click", stopPropagation);

    const works = populateWorks("Tous")
    console.log(works)
};

const closeModal = function (e) {
    if (modal === null) return;
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
    e.preventDefault();
    window.setTimeout(function () {
        modal.style.display = "none";
        modal = null;
    }, 500)
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-close")
        .removeEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-stop")
        .removeEventListener("click", stopPropagation);
};

const stopPropagation = function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(
        (f) => f === modal.querySelector(":focus")
    );
    if (e.shiftKey === true) {
        index--;
    } else {
        index++;
    }
    if (index >= focusables.length) {
        index = 0;
    }
    if (index < 0) {
        index = focusables.length - 1;
    }
    focusables[index].focus();
};

const loadModal = async function (url) {
    const target = "#" + url.split("#")[1]
    const existingModal = document.querySelector(target)
    if (existingModal !== null) return existingModal
    const html = await fetch(url).then(response => response.text())
    const element = document.createRange().createContextualFragment(html).querySelector(target)
    if (element === null) throw `L'élément ${target} n'a pas été trouvé dans la page ${url}`
    document.body.append(element)
    return element
}

document.querySelectorAll(".js-modal").forEach((a) => {
    a.addEventListener("click", openModal);
});

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e);
    }
});

async function populateWorks() {
    // Get data from API
    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const works = await reponseWorks.json();
    // Get DOM element hosting works
    const modalPortfolio = document.querySelector(".modal-portfolio");
    modalPortfolio.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        // Tag creation for work
        const workElement = document.createElement("figure");

        // Tags creation
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const trashButton = document.createElement("button");
        trashButton.className = "modal-button-trash";
        const iconElement = document.createElement("i");
        iconElement.className ="fa-solid fa-trash-can fa-xs";
        trashButton.appendChild(iconElement)

        // Work Element added to Gallery
        modalPortfolio.appendChild(workElement);
        workElement.appendChild(imageElement);
        workElement.appendChild(trashButton);

    }
}
